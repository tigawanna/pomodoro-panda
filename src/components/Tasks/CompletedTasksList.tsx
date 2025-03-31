import { Task } from '../../types';
import styles from './Tasks.module.css';
import completedStyles from './CompletedTasksList.module.css';
interface CompletedTasksListProps {
  tasks: Task[];
}

export const CompletedTasksList: React.FC<CompletedTasksListProps> = ({ tasks }) => {
  if (tasks.length === 0) return null;

  return (
    <div className={styles.taskList}>
      <div className={styles.taskSummary}>
        <div className={styles.summaryItem}>
          <span>Completed · {tasks.length}</span>
        </div>
      </div>

      {/* addd a header section with category & description */}
      <div className={completedStyles.completedTasksHeader}>
        <div className={completedStyles.taskCategory}>Category</div>
        <div className={completedStyles.taskDescription}>Description</div>
        <div className={completedStyles.taskTime}>Completed Time</div>
        <div className={completedStyles.taskDuration}>Duration</div>
      </div>
      
      <div role="list" aria-label="Completed tasks" className={completedStyles.completedTasksList}>
        {tasks.map((task) => (
          <div
            key={task.id}
            className={completedStyles.completedTaskItem}
            role="listitem"
          >
            <div className={styles.taskCategory}>{task.category}</div>
            <div className={styles.taskDescription}>{task.description}</div>
            <div className={styles.taskTime}>
              {new Date(task.endTime!).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            <div className={styles.taskActions}>
              <span className={styles.taskTime}>
                {Math.round(task.duration! / 60000)}m
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 