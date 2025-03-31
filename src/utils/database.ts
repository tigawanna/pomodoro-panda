import { Task } from '../types';

// Add environment check and database name configuration
const IS_PROD = process.env.NODE_ENV === 'production';
const DB_PREFIX = IS_PROD ? 'prod' : 'dev';
const DB_NAME = `${DB_PREFIX}_PomodoroDB` as const;

// Store names as constants
export const TASKS_STORE = 'tasks' as const;
export const COMPLETED_TASKS_STORE = 'completedTasks' as const;

// Database version history with migrations
const DB_MIGRATIONS = {
  1: (db: IDBDatabase) => {
    // Initial version - Basic task management
    const taskStore = db.createObjectStore(TASKS_STORE, { keyPath: 'id' });
    taskStore.createIndex('startTime', 'startTime');
    taskStore.createIndex('order', 'order');
  },
  2: (db: IDBDatabase) => {
    // Added completed tasks tracking
    const completedStore = db.createObjectStore(COMPLETED_TASKS_STORE, { keyPath: 'id' });
    completedStore.createIndex('endTime', 'endTime');
  }
} as const;

// Current version is highest migration number
const DB_VERSION = Math.max(...Object.keys(DB_MIGRATIONS).map(Number));

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Database error:', request.error);
      reject(request.error);
    };

    request.onblocked = () => {
      console.warn('Please close all other tabs with this site open!');
    };

    request.onsuccess = () => {
      const db = request.result;
      
      // Handle version change requests from other tabs
      db.onversionchange = () => {
        db.close();
        console.log('Database is outdated, please reload the page.');
      };

      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const oldVersion = event.oldVersion;

      console.log(`Upgrading database from version ${oldVersion} to ${DB_VERSION}`);

      // Run all migrations in sequence
      for (let version = oldVersion + 1; version <= DB_VERSION; version++) {
        const migration = DB_MIGRATIONS[version as keyof typeof DB_MIGRATIONS];
        if (migration) {
          console.info(`Running database migration to version ${version}`);
          migration(db);
        }
      }
    };
  });
};

export const tasksDB = {
  async add(task: Task): Promise<string> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([TASKS_STORE], 'readwrite');
      const store = transaction.objectStore(TASKS_STORE);

      const request = store.add(task);
      request.onsuccess = () => resolve(task.id);
      request.onerror = () => reject(request.error);
    });
  },

  async getAll(): Promise<Task[]> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([TASKS_STORE], 'readonly');
      const store = transaction.objectStore(TASKS_STORE);

      const request = store.getAll();

      request.onsuccess = () => {
        const tasks = request.result || [];
        // Sort by order property, fallback to startTime
        const sortedTasks = [...tasks].sort((a, b) => {
          if (a.order !== undefined && b.order !== undefined) {
            return a.order - b.order;
          }
          return a.startTime - b.startTime;
        });
        resolve(sortedTasks);
      };

      request.onerror = () => reject(request.error);
    });
  },

  async update(task: Task): Promise<void> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([TASKS_STORE], 'readwrite');
      const store = transaction.objectStore(TASKS_STORE);
      const request = store.put(task);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async updateAll(tasks: Task[]): Promise<void> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([TASKS_STORE], 'readwrite');
      const store = transaction.objectStore(TASKS_STORE);

      transaction.onerror = () => reject(transaction.error);

      // Clear existing tasks
      const clearRequest = store.clear();

      clearRequest.onsuccess = () => {
        // Handle empty array case
        if (tasks.length === 0) {
          resolve();
          return;
        }

        // Add all tasks in order
        let count = 0;
        tasks.forEach((task, index) => {
          const taskWithOrder = { ...task, order: index };
          const request = store.add(taskWithOrder);

          request.onsuccess = () => {
            count++;
            if (count === tasks.length) {
              resolve();
            }
          };

          request.onerror = (event) => {
            event.preventDefault(); // Prevent transaction abort
            reject(request.error);
          };
        });
      };

      clearRequest.onerror = () => reject(clearRequest.error);
    });
  },

  async delete(taskId: string): Promise<void> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([TASKS_STORE], 'readwrite');
      const store = transaction.objectStore(TASKS_STORE);

      // First check if task exists
      const getRequest = store.get(taskId);

      transaction.onerror = () => reject(transaction.error);

      getRequest.onsuccess = () => {
        if (!getRequest.result) {
          resolve(); // Task doesn't exist, nothing to delete
          return;
        }

        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = () => {
          const tasks = getAllRequest.result;
          const sortedTasks = tasks.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

          const deleteRequest = store.delete(taskId);

          deleteRequest.onsuccess = () => {
            const remainingTasks = sortedTasks
              .filter(t => t.id !== taskId)
              .map((task, index) => ({
                ...task,
                order: index
              }));

            if (remainingTasks.length === 0) {
              resolve();
              return;
            }

            const updateTransaction = db.transaction([TASKS_STORE], 'readwrite');
            const updateStore = updateTransaction.objectStore(TASKS_STORE);

            updateTransaction.oncomplete = () => resolve();
            updateTransaction.onerror = () => reject(updateTransaction.error);

            remainingTasks.forEach(task => {
              updateStore.put(task);
            });
          };

          deleteRequest.onerror = () => reject(deleteRequest.error);
        };

        getAllRequest.onerror = () => reject(getAllRequest.error);
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  },

  async getCompletedTasks(): Promise<Task[]> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([COMPLETED_TASKS_STORE], 'readonly');
      const store = transaction.objectStore(COMPLETED_TASKS_STORE);
      const index = store.index('endTime');

      // Get all completed tasks sorted by endTime in descending order
      const request = index.getAll();

      request.onsuccess = () => {
        const tasks = request.result || [];
        resolve(tasks.sort((a, b) => (b.endTime || 0) - (a.endTime || 0)));
      };

      request.onerror = () => reject(request.error);
    });
  },

  async completeOnePomodoro(taskId: string, completedPomodoro: Task): Promise<void> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([TASKS_STORE, COMPLETED_TASKS_STORE], "readwrite");

      transaction.oncomplete = () => {
        console.info('Pomodoro completion transaction successful');
        resolve();
      };

      transaction.onerror = () => {
        console.error('Error in pomodoro completion transaction:', transaction.error);
        reject(transaction.error);
      };

      const tasksStore = transaction.objectStore(TASKS_STORE);
      const completedStore = transaction.objectStore(COMPLETED_TASKS_STORE);

      // Get original task
      const getRequest = tasksStore.get(taskId);

      getRequest.onsuccess = () => {
        const originalTask = getRequest.result;
        if (!originalTask) {
          transaction.abort();
          reject(new Error('Task not found'));
          return;
        }
        const remainingPomodoros = (originalTask.pomodoros || 0) - 1;
        
        // Add to completed store
        completedStore.add(completedPomodoro);
        
        // Update or delete original task
        if (remainingPomodoros >= 1) {
          tasksStore.put({
            ...originalTask,
            pomodoros: remainingPomodoros
          });
        } else {
          tasksStore.delete(taskId);
        }
      };

      getRequest.onerror = () => {
        transaction.abort();
        reject(getRequest.error);
      };
    });
  }
}; 