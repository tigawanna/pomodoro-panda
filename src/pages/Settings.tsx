import { usePostHog } from 'posthog-js/react';
import { useEffect, useState } from 'react';
import styles from './Settings.module.css';
import { useLogger } from '../hooks/useLogger';
import { settingsDB } from '../utils/database';

interface UserSettings {
    addTasksToBottom: boolean;
}

const Settings = () => {
    const logger = useLogger('Settings');
    const posthog = usePostHog();
    const [settings, setSettings] = useState<UserSettings>({
        addTasksToBottom: false
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadSettings() {
            try {
                const value = await settingsDB.get('addTasksToBottom');
                setSettings(prev => ({
                    ...prev,
                    addTasksToBottom: value ?? false
                }));
                setIsLoading(false);
            } catch (error) {
                logger.error('Failed to load settings:', error);
                setIsLoading(false);
            }
        }

        loadSettings();
    }, [logger]);

    const handleToggleTaskPosition = async () => {
        const newValue = !settings.addTasksToBottom;
        try {
            await settingsDB.set('addTasksToBottom', newValue);
            setSettings(prev => ({
                ...prev,
                addTasksToBottom: newValue
            }));
            logger.info('Task position setting updated:', { addTasksToBottom: newValue });
            posthog?.capture('settings_updated', { setting: 'addTasksToBottom', value: newValue });
        } catch (error) {
            logger.error('Failed to update task position setting:', error);
        }
    };

    if (isLoading) {
        return <div className={styles.container}>Loading settings...</div>;
    }

    return (
        <div className={styles.container}>
            <h1>Settings</h1>
            <div className={styles.settingsContent}>
                <div className={styles.settingItem}>
                    <label className={styles.settingLabel}>
                        <span>Add new tasks to bottom of list</span>
                        <div className={styles.toggleSwitch}>
                            <input
                                type="checkbox"
                                checked={settings.addTasksToBottom}
                                onChange={handleToggleTaskPosition}
                            />
                            <span className={styles.slider}></span>
                        </div>
                    </label>
                    <p className={styles.settingDescription}>
                        When enabled, new tasks will be added to the bottom of your task list instead of the top.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Settings; 