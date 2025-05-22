import { describe, test, expect, beforeEach, afterAll } from 'vitest';
import { settingsDB, initDB, SETTINGS_STORE } from '../../utils/database';

describe('Settings Database Integration', () => {
    // Clean up database after all tests
    afterAll(async () => {
        await indexedDB.deleteDatabase('dev_PomodoroDB');
    });

    // Clear settings store before each test
    beforeEach(async () => {
        const db = await initDB();
        await new Promise<void>((resolve, reject) => {
            const transaction = db.transaction([SETTINGS_STORE], 'readwrite');
            const store = transaction.objectStore(SETTINGS_STORE);
            store.clear();

            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    });

    test('should set and get a boolean setting', async () => {
        const key = 'testSetting';
        const value = true;

        await settingsDB.set(key, value);
        const retrievedValue = await settingsDB.get(key);

        expect(retrievedValue).toBe(value);
    });

    test('should update an existing setting', async () => {
        const key = 'updateTest';
        
        // Set initial value
        await settingsDB.set(key, true);
        
        // Update value
        await settingsDB.set(key, false);
        
        // Verify updated value
        const updatedValue = await settingsDB.get(key);
        expect(updatedValue).toBe(false);
    });

    test('should return null for non-existent setting', async () => {
        const value = await settingsDB.get('nonExistentSetting');
        expect(value).toBeNull();
    });

    test('should handle multiple settings', async () => {
        const settings = {
            setting1: true,
            setting2: false,
            setting3: true
        };

        // Set all settings
        await Promise.all(
            Object.entries(settings).map(([key, value]) => 
                settingsDB.set(key, value)
            )
        );

        // Verify all settings
        for (const [key, expectedValue] of Object.entries(settings)) {
            const value = await settingsDB.get(key);
            expect(value).toBe(expectedValue);
        }
    });

    test('should handle transaction integrity during concurrent operations', async () => {
        const operations = Array.from({ length: 10 }, (_, i) => ({
            key: `concurrent-${i}`,
            value: i % 2 === 0
        }));

        // Test concurrent sets
        try {
            await Promise.all(
                operations.map(({ key, value }) => settingsDB.set(key, value))
            );
        } catch (error) {
            console.error('FAILURE IN concurrent settingsDB.set operations');
            throw error;
        }

        // Verify all settings were set correctly
        for (const { key, value } of operations) {
            const retrievedValue = await settingsDB.get(key);
            expect(retrievedValue).toBe(value);
        }
    });

    test('should persist settings across database connections', async () => {
        const key = 'persistenceTest';
        const value = true;

        // Set value
        await settingsDB.set(key, value);

        // Close and reopen database connection
        const db = await initDB();
        db.close();
        await initDB();

        // Verify value persisted
        const retrievedValue = await settingsDB.get(key);
        expect(retrievedValue).toBe(value);
    });

    test('should handle invalid inputs gracefully', async () => {
        // Test with empty key
        await expect(settingsDB.set('', true)).rejects.toThrow();
        
        // Test with very long key (100 characters)
        const longKey = 'a'.repeat(100);
        await settingsDB.set(longKey, true);
        const longKeyValue = await settingsDB.get(longKey);
        expect(longKeyValue).toBe(true);
    });
}); 