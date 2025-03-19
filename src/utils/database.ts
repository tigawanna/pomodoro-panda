import { Task } from '../types';

const DB_NAME = 'PomodoroDB';
const DB_VERSION = 1;
const TASKS_STORE = 'tasks';

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(TASKS_STORE)) {
        db.createObjectStore(TASKS_STORE, { keyPath: 'id' });
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
        // Sort by order if it exists, otherwise by startTime
        const tasks = request.result.sort((a, b) => 
          (a.order ?? a.startTime) - (b.order ?? b.startTime)
        );
        resolve(tasks);
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
      
      console.log('Starting updateAll with tasks:', tasks);
      
      // Delete all existing entries
      store.clear();
      
      // Add tasks with order field
      tasks.forEach((task, index) => {
        const taskWithOrder = { ...task, order: index };
        store.add(taskWithOrder);
      });
      
      transaction.oncomplete = () => {
        console.log('Transaction completed successfully');
        resolve();
      };
      
      transaction.onerror = (event) => {
        console.error('Transaction failed:', event);
        reject(transaction.error);
      };
    });
  }
}; 