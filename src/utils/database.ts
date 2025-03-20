import { Task } from '../types';

const DB_NAME = 'PomodoroDB';
const DB_VERSION = 2;
export const TASKS_STORE = 'tasks' as const;
export const COMPLETED_TASKS_STORE = 'completedTasks' as const;

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error);
    };
    
    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create or verify tasks store exists
      if (!db.objectStoreNames.contains(TASKS_STORE)) {
        db.createObjectStore(TASKS_STORE, { keyPath: 'id' });
      }

      // Create completed tasks store
      if (!db.objectStoreNames.contains(COMPLETED_TASKS_STORE)) {
        const completedStore = db.createObjectStore(COMPLETED_TASKS_STORE, { keyPath: 'id' });
        // Add index for completion time to enable sorting
        completedStore.createIndex('endTime', 'endTime');
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
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  },

  async updateAll(tasks: Task[]): Promise<void> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([TASKS_STORE], 'readwrite');
      const store = transaction.objectStore(TASKS_STORE);
      
      transaction.onerror = () => {
        reject(transaction.error);
      };
      
      // Clear existing tasks
      const clearRequest = store.clear();
      
      clearRequest.onsuccess = () => {
        // Add all tasks in order
        let count = 0;
        
        // Handle empty array case
        if (tasks.length === 0) {
          resolve();
          return;
        }
        
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
      
      clearRequest.onerror = () => {
        reject(clearRequest.error);
      };
    });
  },

  async delete(taskId: string): Promise<void> {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([TASKS_STORE], 'readwrite');
      const store = transaction.objectStore(TASKS_STORE);
      
      const getAllRequest = store.getAll();
      
      transaction.onerror = () => reject(transaction.error);

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
          
          updateTransaction.oncomplete = () => {
            resolve();
          };

          updateTransaction.onerror = () => {
            reject(updateTransaction.error);
          };

          remainingTasks.forEach(task => {
            updateStore.put(task);
          });
        };

        deleteRequest.onerror = () => reject(deleteRequest.error);
      };

      getAllRequest.onerror = () => reject(getAllRequest.error);
    });
  },

  async markAsCompleted(task: Task): Promise<void> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([TASKS_STORE, COMPLETED_TASKS_STORE], 'readwrite');
      const tasksStore = transaction.objectStore(TASKS_STORE);
      const completedStore = transaction.objectStore(COMPLETED_TASKS_STORE);
      
      // Validate completion metadata
      if (!task.endTime || task.endTime <= task.startTime) {
        reject(new Error('Invalid completion time'));
        return;
      }

      // Delete from active tasks
      const deleteRequest = tasksStore.delete(task.id);
      
      deleteRequest.onsuccess = () => {
        // Add to completed tasks
        const addRequest = completedStore.add(task);
        
        addRequest.onsuccess = () => {
          resolve();
        };
        
        addRequest.onerror = () => {
          reject(addRequest.error);
        };
      };
      
      deleteRequest.onerror = () => {
        reject(deleteRequest.error);
      };
      
      transaction.onerror = () => {
        reject(transaction.error);
      };
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
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  },

  async completeOnePomodoro(taskId: string, completedPomodoro: Task): Promise<void> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([TASKS_STORE, COMPLETED_TASKS_STORE], "readwrite");
      
      // Set up transaction handlers first
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
        if (remainingPomodoros > 0) {
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