import { describe, test, expect, beforeEach, afterAll } from 'vitest';
import { tasksDB, initDB } from '../../../utils/database';
import type { Task } from '../../../types';

describe('Database Integration', () => {
  // Clean up database after all tests
  afterAll(async () => {
    await indexedDB.deleteDatabase('PomodoroDB');
  });

  beforeEach(async () => {
    // Clear database before each test
    const db = await initDB();
    const transaction = db.transaction(['tasks'], 'readwrite');
    const store = transaction.objectStore('tasks');
    await new Promise<void>((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });

  test('should add and retrieve a task', async () => {
    const task: Task = {
      id: '1',
      description: 'Test Task',
      category: 'Work',
      startTime: Date.now(),
      completed: false,
      pomodoros: 0
    };

    // Test add function
    const id = await tasksDB.add(task);
    expect(id).toBe(task.id);

    // Test getAll function
    const tasks = await tasksDB.getAll();
    expect(tasks.length).toBe(1);
    expect(tasks[0].id).toBe(task.id);
  });

  test('should preserve task order after page refresh', async () => {
    // Create tasks in specific order
    const tasks: Task[] = [
      { id: '1', description: 'First', category: 'Work', startTime: Date.now(), completed: false, pomodoros: 0 },
      { id: '2', description: 'Second', category: 'Work', startTime: Date.now() + 1000, completed: false, pomodoros: 0 },
      { id: '3', description: 'Third', category: 'Work', startTime: Date.now() + 2000, completed: false, pomodoros: 0 }
    ];

    // Add tasks one by one
    for (const task of tasks) {
      await tasksDB.add(task);
    }

    // Verify initial order (should be by startTime)
    let retrievedTasks = await tasksDB.getAll();
    expect(retrievedTasks[0].id, 'Initial order should have task 1 first').toBe('1');
    expect(retrievedTasks[1].id, 'Initial order should have task 2 second').toBe('2');
    expect(retrievedTasks[2].id, 'Initial order should have task 3 third').toBe('3');

    // Reorder tasks (3, 1, 2)
    const reorderedTasks = [
      retrievedTasks[2], // Third -> First
      retrievedTasks[0], // First -> Second
      retrievedTasks[1]  // Second -> Third
    ];

    // Update with new order
    await tasksDB.updateAll(reorderedTasks);

    // Verify new order
    retrievedTasks = await tasksDB.getAll();
    
    try {
      expect(retrievedTasks[0].id, 'After reordering, task 3 should be first').toBe('3');
      expect(retrievedTasks[1].id, 'After reordering, task 1 should be second').toBe('1');
      expect(retrievedTasks[2].id, 'After reordering, task 2 should be third').toBe('2');
    } catch (error) {
      console.error('FAILURE IN tasksDB.updateAll() - Tasks not stored with correct order properties');
      console.error('The updateAll function must assign order properties to tasks before storing');
      console.error('Current task orders:', retrievedTasks.map(t => ({ id: t.id, order: t.order })));
      throw error;
    }

    // Simulate page refresh by reinitializing DB
    await initDB();

    // Verify order is preserved after "refresh"
    const tasksAfterRefresh = await tasksDB.getAll();
    
    try {
      expect(tasksAfterRefresh[0].id, 'After page refresh, task 3 should still be first').toBe('3');
      expect(tasksAfterRefresh[1].id, 'After page refresh, task 1 should still be second').toBe('1');
      expect(tasksAfterRefresh[2].id, 'After page refresh, task 2 should still be third').toBe('2');
    } catch (error) {
      console.error('FAILURE IN tasksDB.updateAll() - Order not preserved after page refresh');
      console.error('Tasks were not stored with order properties in updateAll()');
      console.error('Current task orders:', tasksAfterRefresh.map(t => ({ id: t.id, order: t.order })));
      throw error;
    }
  });

  test('should handle tasks with same startTime but different order', async () => {
    // Create tasks with identical startTime
    const now = Date.now();
    const tasks: Task[] = [
      { id: '1', description: 'Task A', category: 'Work', startTime: now, completed: false, pomodoros: 0 },
      { id: '2', description: 'Task B', category: 'Work', startTime: now, completed: false, pomodoros: 0 },
      { id: '3', description: 'Task C', category: 'Work', startTime: now, completed: false, pomodoros: 0 }
    ];

    // Add tasks with explicit order using updateAll
    await tasksDB.updateAll(tasks);

    // Verify order matches the array order
    const retrievedTasks = await tasksDB.getAll();
    expect(retrievedTasks[0].id).toBe('1');
    expect(retrievedTasks[1].id).toBe('2');
    expect(retrievedTasks[2].id).toBe('3');

    // Reorder tasks (3, 2, 1)
    const reorderedTasks = [
      { ...tasks[2], order: 0 },
      { ...tasks[1], order: 1 },
      { ...tasks[0], order: 2 }
    ];

    // Update with new order
    await tasksDB.updateAll(reorderedTasks);

    // Verify new order
    const tasksAfterReorder = await tasksDB.getAll();
    expect(tasksAfterReorder[0].id).toBe('3');
    expect(tasksAfterReorder[1].id).toBe('2');
    expect(tasksAfterReorder[2].id).toBe('1');

    // Verify that the order properties are correctly assigned
    expect(tasksAfterReorder[0].order).toBe(0);
    expect(tasksAfterReorder[1].order).toBe(1);
    expect(tasksAfterReorder[2].order).toBe(2);
  });

  test('should update existing tasks', async () => {
    // Add initial task
    const task: Task = {
      id: 'update-test',
      description: 'Initial description',
      category: 'Work',
      startTime: Date.now(),
      completed: false,
      pomodoros: 0
    };
    
    try {
      await tasksDB.add(task);
    } catch (error: unknown) {
      console.error('FAILURE: Could not add initial task');
      throw error;
    }
    
    // Update the task
    const updatedTask = {
      ...task,
      description: 'Updated description',
      pomodoros: 1,
      completed: true
    };
    
    try {
      await tasksDB.update(updatedTask);
    } catch (error: unknown) {
      console.error('FAILURE IN tasksDB.update() - Cannot update existing task');
      console.error('The update function is using store.add() instead of store.put()');
      console.error('store.add() fails when the record already exists');
      console.error('Fix by changing store.add(task) to store.put(task) in the update function');
      throw error;
    }
    
    try {
      // Verify the update
      const tasks = await tasksDB.getAll();
      expect(tasks.length).toBe(1);
      expect(tasks[0].description).toBe('Updated description');
      expect(tasks[0].pomodoros).toBe(1);
      expect(tasks[0].completed).toBe(true);
    } catch (error: unknown) {
      console.error('FAILURE: Could not verify task update');
      console.error('Expected updated values were not found in the database');
      throw error;
    }
  });

  test('should handle empty task list', async () => {
    let timeoutId: NodeJS.Timeout | undefined;
    
    try {
      await Promise.race([
        tasksDB.updateAll([]),
        new Promise((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error('FAILURE IN tasksDB.updateAll() - Promise never resolved for empty array. Check if empty array handling is implemented.'));
          }, 5000);
        })
      ]);
      
      if (timeoutId) clearTimeout(timeoutId);
      
      // If we get here, updateAll resolved successfully
      const tasks = await tasksDB.getAll();
      expect(tasks).toEqual([]);
      
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
        console.error('Fix by adding this check in clearRequest.onsuccess:');
        console.error('if (tasks.length === 0) { resolve(); return; }');
      }
      throw error;
    }
    
    try {
      // Add a task after clearing
      const task: Task = {
        id: 'after-clear',
        description: 'Added after clear',
        category: 'Work',
        startTime: Date.now(),
        completed: false,
        pomodoros: 0
      };
      
      await tasksDB.add(task);
      
      // Verify task was added
      const updatedTasks = await tasksDB.getAll();
      expect(updatedTasks.length).toBe(1);
      expect(updatedTasks[0].id).toBe('after-clear');
    } catch (error) {
      console.error('FAILURE IN tasksDB - Cannot add task after clearing');
      console.error('The database should accept new tasks after being cleared');
      throw error;
    }
  }, 15000);
}); 