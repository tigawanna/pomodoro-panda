import { describe, test, expect, beforeEach, afterAll } from 'vitest';
import { tasksDB, initDB, TASKS_STORE, COMPLETED_TASKS_STORE } from '../../utils/database'; import type { Task } from '../../types';
import { fail } from 'assert';
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_TIMER_SETTINGS } from '../../constants/timerConstants';
describe('Database Integration', () => {
  // Clean up database after all tests
  afterAll(async () => {
    await indexedDB.deleteDatabase('dev_PomodoroDB');
  });

  // Add beforeEach to clean up both stores
  beforeEach(async () => {
    const db = await initDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([TASKS_STORE, COMPLETED_TASKS_STORE], 'readwrite');
      const tasksStore = transaction.objectStore(TASKS_STORE);
      const completedStore = transaction.objectStore(COMPLETED_TASKS_STORE);

      // Clear both stores
      tasksStore.clear();
      completedStore.clear();

      transaction.oncomplete = () => {
        resolve();
      };

      transaction.onerror = () => {
        reject(transaction.error);
      };
    });
  });

  test('should add and retrieve a task', async () => {
    const task: Task = {
      id: '1',
      description: 'Test Task',
      category: 'Work',
      completed: false,
      pomodoros: 1
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
      { id: '1', description: 'First', category: 'Work', completed: false, pomodoros: 1 },
      { id: '2', description: 'Second', category: 'Work', completed: false, pomodoros: 1 },
      { id: '3', description: 'Third', category: 'Work', completed: false, pomodoros: 1 }
    ];

    // Add tasks one by one with order
    for (const [index, task] of tasks.entries()) {
      await tasksDB.add({ ...task, order: index });
    }

    // Verify initial order (should be by endTime)
    let retrievedTasks = await tasksDB.getAll();
    try {
      expect(retrievedTasks[0].id, 'Initial order should have task 1 first').toBe('1');
      expect(retrievedTasks[1].id, 'Initial order should have task 2 second').toBe('2');
      expect(retrievedTasks[2].id, 'Initial order should have task 3 third').toBe('3');
    } catch (error) {
      console.error('FAILURE IN tasksDB.getAll()');
      console.error('\nCurrent task order:', retrievedTasks.map(t => ({
        id: t.id,
        order: t.order
      })));
      throw error;
    }

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

  test('should handle tasks with same endTime but different order', async () => {
    const now = Date.now();
    const tasks: Task[] = [
      { 
        id: uuidv4(), 
        description: 'Task A', 
        category: 'Work', 
        completed: true, 
        endTime: now,
        pomodoros: 1 
      },
      { 
        id: uuidv4(), 
        description: 'Task B', 
        category: 'Work', 
        completed: true, 
        endTime: now,
        pomodoros: 1 
      }
    ];
    
    await tasksDB.updateAll(tasks);
    const tasksFromStore = await tasksDB.getAll();
    expect(tasksFromStore.length).toBe(tasks.length);
    expect(tasksFromStore.every(t => tasks.some(t2 => t2.id === t.id))).toBe(true);

    for (const task of tasksFromStore) {
      await tasksDB.completeOnePomodoro(task.id, task);
    }

    const completedTasks = await tasksDB.getCompletedTasks();
    expect(completedTasks.length).toBe(2);
    expect(completedTasks[0].endTime).toBe(completedTasks[1].endTime);
    if (completedTasks[0].order && completedTasks[1].order) {
      expect(completedTasks[0].order).toBeLessThan(completedTasks[1].order);
    }
  });

  test('should update existing tasks', async () => {
    // Add initial task
    const task: Task = {
      id: 'update-test',
      description: 'Initial description',
      category: 'Work',
      completed: false,
      pomodoros: 1
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
      pomodoros: 2,
      completed: true
    };

    try {
      await tasksDB.update(updatedTask);
    } catch (error: unknown) {
      console.error('FAILURE IN tasksDB.update() - Cannot update existing task');
      throw error;
    }

    try {
      // Verify the update
      const tasks = await tasksDB.getAll();
      expect(tasks.length).toBe(1);
      expect(tasks[0].description).toBe('Updated description');
      expect(tasks[0].pomodoros).toBe(2);
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
            reject(new Error('FAILURE IN tasksDB.updateAll()'));
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
        completed: false,
        pomodoros: 1
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

  test('should handle transactions correctly', async () => {
    const task: Task = {
      id: 'transaction-test',
      description: 'Test Transaction',
      category: 'Work',
      completed: false,
      pomodoros: 1
    };

    try {
      await tasksDB.add(task);
    } catch (error: unknown) {
      console.error('FAILURE IN tasksDB.add()');
      console.error('Operation: Adding task with ID:', task.id);
      console.error('Status: Transaction inactive when attempting database operation');

      if (error instanceof Error) {
        console.error('\nError details:', {
          name: error.name,
          message: error.message,
          location: 'tasksDB.add() -> store operation'
        });
      }
      throw error;
    }

    try {
      const tasks = await tasksDB.getAll();
      expect(tasks.length).toBe(1);
      expect(tasks[0].id).toBe('transaction-test');
    } catch (error: unknown) {
      console.error('FAILURE IN tasksDB.getAll()');


      if (error instanceof Error) {
        console.error('\nError details:', {
          name: error.name,
          message: error.message,
          location: 'tasksDB.getAll() -> store operation'
        });
      }
      throw error;
    }
  }, 2000);

  test('should maintain transaction integrity during add operation', async () => {
    const tasks: Task[] = Array.from({ length: 10 }, (_, i) => ({
      id: `concurrent-${i}`,
      description: `Task ${i}`,
      category: 'Work',
      completed: false,
      pomodoros: 1
    }));

    // Test concurrent adds to stress test transaction handling
    try {
      await Promise.all(tasks.map(task => tasksDB.add(task)));
    } catch (error) {
      console.error('FAILURE IN concurrent tasksDB.add operations');
      console.error('Possible cause: Transaction expired before operation completed');
      throw error;
    }

    // Verify all tasks were added correctly
    const savedTasks = await tasksDB.getAll();
    expect(savedTasks.length).toBe(tasks.length);

    // Verify order integrity
    tasks.forEach(task => {
      expect(savedTasks.some(t => t.id === task.id)).toBe(true);
    });
  });

  // Add a test with artificial delay to catch transaction timeouts
  test('should handle slow operations without transaction expiry', async () => {
    const task: Task = {
      id: 'slow-operation',
      description: 'Slow Task',
      category: 'Work',
      completed: false,
      pomodoros: 1
    };

    try {
      // Add artificial delay to simulate slow operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      await tasksDB.add(task);

      const savedTasks = await tasksDB.getAll();
      expect(savedTasks.some(t => t.id === task.id)).toBe(true);
    } catch (error) {
      console.error('FAILURE: Transaction expired during slow operation');
      console.error('IndexedDB transactions must complete within the same event loop iteration');
      throw error;
    }
  });

  test('should handle transaction lifecycle correctly', async () => {
    const task: Task = {
      id: 'transaction-state',
      description: 'Test Transaction State',
      category: 'Work',
      completed: false,
      pomodoros: 1
    };

    const db = await initDB();

    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction([TASKS_STORE], 'readwrite');
        const store = transaction.objectStore(TASKS_STORE);

        // Add request to keep transaction active
        const request = store.add(task);

        // Handle transaction completion
        transaction.oncomplete = () => {
          resolve();
        };

        // Handle transaction errors
        transaction.onerror = () => {
          reject(new Error('Transaction failed'));
        };

        // Handle request errors
        request.onerror = () => {
          reject(request.error);
        };
      });

      // Verify the task was added
      const verifyTransaction = db.transaction([TASKS_STORE], 'readonly');
      const store = verifyTransaction.objectStore(TASKS_STORE);

      const getRequest = store.get(task.id);

      const savedTask = await new Promise<Task>((resolve, reject) => {
        getRequest.onsuccess = () => resolve(getRequest.result);
        getRequest.onerror = () => reject(getRequest.error);
      });

      expect(savedTask.id).toBe(task.id);

    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  }, 1000); // Reduced timeout since transaction should complete quickly

  test('should handle duplicate ID errors correctly', async () => {
    const task: Task = {
      id: 'duplicate-test',
      description: 'Original Task',
      category: 'Work',
      completed: false,
      pomodoros: 1
    };

    // Add the first task
    await tasksDB.add(task);

    // Attempt to add the same task again
    try {
      await tasksDB.add(task);
      throw new Error('Should not succeed in adding duplicate task');
    } catch (error) {
      // Verify it's the expected constraint error
      expect(error).toBeDefined();
      if (error instanceof Error) {
        expect(error.name).toMatch(/Constraint|Key/i);
      }
    }

    // Verify only one task exists
    const tasks = await tasksDB.getAll();
    expect(tasks.length).toBe(1);
    expect(tasks[0].id).toBe('duplicate-test');
    expect(tasks[0].description).toBe('Original Task');
  });

  test('should delete a task and maintain order', async () => {
    // Setup initial tasks
    const tasks: Task[] = [
      { id: '1', description: 'Task A', category: 'Work', completed: false, pomodoros: 1, order: 0 },
      { id: '2', description: 'Task B', category: 'Work', completed: false, pomodoros: 1, order: 1 },
      { id: '3', description: 'Task C', category: 'Work', completed: false, pomodoros: 1, order: 2 }
    ];

    // Add all tasks
    await tasksDB.updateAll(tasks);

    // Delete middle task
    await tasksDB.delete('2');

    // Verify remaining tasks and their order
    const remainingTasks = await tasksDB.getAll();
    expect(remainingTasks.length).toBe(2);
    expect(remainingTasks[0].id).toBe('1');
    expect(remainingTasks[1].id).toBe('3');
    expect(remainingTasks[0].order).toBe(0);
    expect(remainingTasks[1].order).toBe(1);
  });

  test('should handle deleting non-existent task', async () => {
    try {
      // get all tasks
      await tasksDB.delete('non-existent-id');
      // Should not throw error for non-existent task
    } catch (error) {
      console.error('FAILURE IN tasksDB.delete() - Should not throw error when deleting non-existent task');
      console.error('Error:', error);
      fail('Should not throw error when deleting non-existent task');
    }
  });

  test('should handle deleting tasks at different positions', async () => {
    const tasks: Task[] = [
      { id: 'first', description: 'First Task', category: 'Work', completed: false, pomodoros: 1, order: 0 },
      { id: 'middle', description: 'Middle Task', category: 'Work', completed: false, pomodoros: 1, order: 1 },
      { id: 'last', description: 'Last Task', category: 'Work', completed: false, pomodoros: 1, order: 2 }
    ];

    await tasksDB.updateAll(tasks);

    // Test deleting first task
    await tasksDB.delete('first');
    let remainingTasks = await tasksDB.getAll();

    try {
      expect(remainingTasks.length).toBe(2);
      expect(remainingTasks[0].id).toBe('middle');
      expect(remainingTasks[0].order).toBe(0);
      expect(remainingTasks[1].order).toBe(1);
    } catch (error) {
      console.error('\nFirst deletion assertion failed:');
      console.error('Expected:', { length: 2, firstId: 'middle', firstOrder: 0, secondOrder: 1 });
      console.error('Received:', {
        length: remainingTasks.length,
        firstId: remainingTasks[0]?.id,
        firstOrder: remainingTasks[0]?.order,
        secondOrder: remainingTasks[1]?.order
      });
      throw error;
    }

    // Test deleting last task
    await tasksDB.delete('last');
    remainingTasks = await tasksDB.getAll();


    try {
      expect(remainingTasks.length).toBe(1);
      expect(remainingTasks[0].id).toBe('middle');
      expect(remainingTasks[0].order).toBe(0);
    } catch (error) {
      console.error('\nSecond deletion assertion failed:');
      console.error('Expected:', { length: 1, firstId: 'middle', firstOrder: 0 });
      console.error('Received:', {
        length: remainingTasks.length,
        firstId: remainingTasks[0]?.id,
        firstOrder: remainingTasks[0]?.order
      });
      throw error;
    }
  });

  test('should maintain data integrity during delete operation', async () => {
    const task: Task = {
      id: 'integrity-test',
      description: 'Test Task',
      category: 'Work',
      completed: false,
      pomodoros: 1,
      order: 0
    };

    // Add task
    await tasksDB.add(task);

    // Delete task
    await tasksDB.delete(task.id);

    // Verify task is deleted
    const tasks = await tasksDB.getAll();
    expect(tasks.length).toBe(0);

    // Try to add the same task again (should work as original was deleted)
    await tasksDB.add(task);
    const tasksAfterReAdd = await tasksDB.getAll();
    expect(tasksAfterReAdd.length).toBe(1);
    expect(tasksAfterReAdd[0].id).toBe(task.id);
  });

  test('should update task pomodoro count', async () => {
    const task: Task = {
      id: '1',
      description: 'Test Task',
      category: 'Work',
      completed: false,
      pomodoros: 1,
      order: 0
    };

    await tasksDB.add(task);

    const updatedTask = { ...task, pomodoros: 2 };
    await tasksDB.update(updatedTask);

    const tasks = await tasksDB.getAll();
    expect(tasks[0].pomodoros).toBe(2);
  });

  test('should edit task fields', async () => {
    const task: Task = {
      id: 'edit-test',
      description: 'Initial description',
      category: 'Work',
      completed: false,
      pomodoros: 1,
      order: 0
    };

    // Add initial task
    await tasksDB.add(task);

    // Edit task fields
    const editedTask = {
      ...task,
      description: 'Updated description',
      category: 'Personal'
    };

    try {
      await tasksDB.update(editedTask);
    } catch (error: unknown) {
      console.error('FAILURE IN tasksDB.update() - Cannot edit task fields');
      throw error;
    }

    // Verify the update
    const tasks = await tasksDB.getAll();
    expect(tasks.length).toBe(1);
    expect(tasks[0].description).toBe('Updated description');
    expect(tasks[0].category).toBe('Personal');

    // Verify other fields remained unchanged
    expect(tasks[0].id).toBe(task.id);
    expect(tasks[0].completed).toBe(task.completed);
    expect(tasks[0].pomodoros).toBe(task.pomodoros);
    expect(tasks[0].order).toBe(task.order);
  });

  test('should handle completing of multi-pomodoro tasks', async () => {
    const taskId = uuidv4();
    const task: Task = {
      id: taskId,
      description: 'Multi-pomodoro Task',
      category: 'Work',
      completed: false,
      pomodoros: 2
    };

    await tasksDB.add(task);

    const completedPomodoro = {
      ...task,
      id: `${taskId}_completed`,
      completed: true,
      endTime: Date.now(),
      pomodoros: 1
    };

    await tasksDB.completeOnePomodoro(taskId, completedPomodoro);

    const [activeTasks, completedTasks] = await Promise.all([
      tasksDB.getAll(),
      tasksDB.getCompletedTasks()
    ]);

    expect(activeTasks.length).toBe(1);
    expect(activeTasks[0].pomodoros).toBe(1);
    expect(completedTasks.length).toBe(1);
    expect(completedTasks[0].endTime).toBeDefined();
    expect(completedTasks[0].pomodoros).toBe(1);

    // Complete second pomodoro
    const finalPomodoro = {
      ...task,
      id: `${taskId}_final`,
      completed: true,
      endTime: Date.now() + 1000, // Ensure different endTime
      pomodoros: 1
    };

    await tasksDB.completeOnePomodoro(taskId, finalPomodoro);

    // Verify final states
    const [finalActiveTasks, finalCompletedTasks] = await Promise.all([
      tasksDB.getAll(),
      tasksDB.getCompletedTasks()
    ]);

    // No active tasks should remain
    expect(finalActiveTasks.length).toBe(0);
    
    // Should have two completed pomodoros
    expect(finalCompletedTasks.length).toBe(2);
    // Most recent completion should be first
    expect(finalCompletedTasks[0].id).toBe(finalPomodoro.id);
    expect(finalCompletedTasks[1].id).toBe(completedPomodoro.id);
  });

  test('should order completed tasks by endTime', async () => {
    const baseTime = Date.now();
    const originalTaskId = uuidv4();
    
    const task: Task = {
      id: originalTaskId,
      description: 'Multi-pomodoro task',
      category: 'Work',
      completed: false,
      pomodoros: 3
    };

    await tasksDB.add(task);

    // Complete pomodoros at different times
    const completedPomodoro1 = {
      ...task,
      id: `completed-${originalTaskId}-${baseTime - 2000}`,
      completed: true,
      endTime: baseTime - 2000,
      duration: DEFAULT_TIMER_SETTINGS.workDuration ,
      pomodoros: 1
    };

    const completedPomodoro2 = {
      ...task,
      id: `completed-${originalTaskId}-${baseTime - 1000}`,
      completed: true,
      endTime: baseTime - 1000,
      duration: DEFAULT_TIMER_SETTINGS.workDuration ,
      pomodoros: 1
    };

    const completedPomodoro3 = {
      ...task,
      id: `completed-${originalTaskId}-${baseTime}`,
      completed: true,
      endTime: baseTime,
      duration: DEFAULT_TIMER_SETTINGS.workDuration ,
      pomodoros: 1
    };

    // Complete pomodoros in random order
    await tasksDB.completeOnePomodoro(originalTaskId, completedPomodoro2);
    await tasksDB.completeOnePomodoro(originalTaskId, completedPomodoro1);
    await tasksDB.completeOnePomodoro(originalTaskId, completedPomodoro3);

    const completedTasks = await tasksDB.getCompletedTasks();
    expect(completedTasks.length).toBe(3);
    // Should be ordered by endTime descending (newest first)
    expect(completedTasks[0].endTime).toBe(baseTime);
    expect(completedTasks[1].endTime).toBe(baseTime - 1000);
    expect(completedTasks[2].endTime).toBe(baseTime - 2000);
  });

  test('should handle tasks without optional fields', async () => {
    const taskId = uuidv4();
    const minimalTask: Task = {
      id: taskId,
      description: 'Minimal Task',
      category: 'Work',
      completed: false,
      pomodoros: 1
    };

    await tasksDB.add(minimalTask);
    const tasks = await tasksDB.getAll();
    expect(tasks.length).toBe(1);
    expect(tasks[0].endTime).toBeUndefined();
    expect(tasks[0].duration).toBeUndefined();
  });

  test('should maintain order during batch updates', async () => {
    const tasks: Task[] = [
      { id: uuidv4(), description: 'First', category: 'Work', completed: false, pomodoros: 1 },
      { id: uuidv4(), description: 'Second', category: 'Work', completed: false, pomodoros: 1 },
      { id: uuidv4(), description: 'Third', category: 'Work', completed: false, pomodoros: 1 }
    ];

    // Initial add with order
    await tasksDB.updateAll(tasks);

    // Get tasks to verify order was assigned
    const initialTasks = await tasksDB.getAll();
    expect(initialTasks[0].order).toBe(0);
    expect(initialTasks[1].order).toBe(1);
    expect(initialTasks[2].order).toBe(2);

    // Reorder tasks (move last to first)
    const reorderedTasks = [
      initialTasks[2],
      initialTasks[0],
      initialTasks[1]
    ];

    await tasksDB.updateAll(reorderedTasks);

    const finalTasks = await tasksDB.getAll();
    expect(finalTasks[0].description).toBe('Third');
    expect(finalTasks[1].description).toBe('First');
    expect(finalTasks[2].description).toBe('Second');
  });

  test('should update completed task fields (duration, category, description)', async () => {
    const baseTime = Date.now();
    const completedTask: Task = {
      id: 'completed-edit-test',
      description: 'Initial completed description',
      category: 'Work',
      completed: true,
      pomodoros: 1,
      endTime: baseTime,
      duration: DEFAULT_TIMER_SETTINGS.workDuration 
    };

    // Add initial completed task directly to the completed store
    const db = await initDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([COMPLETED_TASKS_STORE], 'readwrite');
      const store = transaction.objectStore(COMPLETED_TASKS_STORE);
      const request = store.add(completedTask);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });

    // Edit completed task fields - specifically duration, category, and description
    const editedTask = {
      ...completedTask,
      description: 'Updated completed description',
      category: 'Personal',
      duration: DEFAULT_TIMER_SETTINGS.longBreakDuration 
    };

    try {
      await tasksDB.updateCompletedTask(editedTask);
    } catch (error: unknown) {
      console.error('FAILURE IN tasksDB.updateCompletedTask() - Cannot edit completed task fields');
      throw error;
    }

    // Verify the update
    const completedTasks = await tasksDB.getCompletedTasks();
    
    try {
      expect(completedTasks.length).toBe(1);
      expect(completedTasks[0].description).toBe('Updated completed description');
      expect(completedTasks[0].category).toBe('Personal');
      expect(completedTasks[0].duration).toBe(DEFAULT_TIMER_SETTINGS.longBreakDuration );
    } catch (error) {
      console.error('FAILURE: Could not verify completed task update');
      console.error('Expected updated values were not found in the database');
      throw error;
    }

    // Verify other fields remained unchanged
    try {
      expect(completedTasks[0].id).toBe(completedTask.id);
      expect(completedTasks[0].completed).toBe(completedTask.completed);
      expect(completedTasks[0].pomodoros).toBe(completedTask.pomodoros);
      expect(completedTasks[0].endTime).toBe(completedTask.endTime);
    } catch (error) {
      console.error('FAILURE: Other fields were unexpectedly modified during update');
      console.error('Original task:', completedTask);
      console.error('Updated task:', completedTasks[0]);
      throw error;
    }
  });

  test('should delete completed tasks', async () => {
    const now = Date.now();
    const completedTasks: Task[] = [
      {
        id: 'completed-delete-test-1',
        description: 'Completed Task 1',
        category: 'Work',
        completed: true,
        pomodoros: 1,
        endTime: now - 2000,
        duration: DEFAULT_TIMER_SETTINGS.workDuration 
      },
      {
        id: 'completed-delete-test-2',
        description: 'Completed Task 2',
        category: 'Personal',
        completed: true,
        pomodoros: 1,
        endTime: now - 1000,
        duration: DEFAULT_TIMER_SETTINGS.workDuration 
      },
      {
        id: 'completed-delete-test-3',
        description: 'Completed Task 3',
        category: 'Study',
        completed: true,
        pomodoros: 1,
        endTime: now,
        duration: DEFAULT_TIMER_SETTINGS.workDuration 
      }
    ];

    // Add completed tasks directly to the completed store
    const db = await initDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([COMPLETED_TASKS_STORE], 'readwrite');
      const store = transaction.objectStore(COMPLETED_TASKS_STORE);
      
      let count = 0;
      completedTasks.forEach(task => {
        const request = store.add(task);
        request.onsuccess = () => {
          count++;
          if (count === completedTasks.length) {
            resolve();
          }
        };
        request.onerror = () => reject(request.error);
      });
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });

    // Verify tasks were added
    let tasks = await tasksDB.getCompletedTasks();
    
    try {
      expect(tasks.length).toBe(3);
    } catch (error) {
      console.error('FAILURE: Could not add test completed tasks');
      console.error('Expected 3 tasks, got', tasks.length);
      throw error;
    }

    // Delete middle task
    try {
      await tasksDB.deleteCompletedTask('completed-delete-test-2');
    } catch (error: unknown) {
      console.error('FAILURE IN tasksDB.deleteCompletedTask() - Cannot delete completed task');
      throw error;
    }

    // Verify deletion
    tasks = await tasksDB.getCompletedTasks();
    
    try {
      expect(tasks.length).toBe(2);
      expect(tasks.some(t => t.id === 'completed-delete-test-2')).toBe(false);
      expect(tasks.some(t => t.id === 'completed-delete-test-1')).toBe(true);
      expect(tasks.some(t => t.id === 'completed-delete-test-3')).toBe(true);
    } catch (error) {
      console.error('FAILURE: Deletion verification failed');
      console.error('Expected 2 tasks with IDs "completed-delete-test-1" and "completed-delete-test-3"');
      console.error('Got tasks:', tasks.map(t => t.id));
      throw error;
    }

    // Try deleting non-existent task (should not throw)
    try {
      await tasksDB.deleteCompletedTask('non-existent-completed-task');
      // Should not throw error for non-existent task
    } catch (error) {
      console.error('FAILURE IN tasksDB.deleteCompletedTask() - Should not throw error when deleting non-existent task');
      console.error('Error:', error);
      fail('Should not throw error when deleting non-existent task');
    }
  });
}); 