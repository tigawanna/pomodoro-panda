import { useContext } from 'react';
import TimerContext from '../contexts/TimerContext';

export default function useTimerContext() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimerContext must be used within a TimerProvider');
  }
  
  const { 
    state, 
    startTimer, 
    pauseTimer, 
    resetTimer, 
    switchTimer, 
    updateTimerState,
    setOnComplete,
    settings
  } = context;
  
  return {
    // State properties
    timeLeft: state.timeLeft,
    isRunning: state.isRunning,
    hasStarted: state.hasStarted,
    timerType: state.timerType,
    activeTaskId: state.activeTaskId,
    startTime: state.startTime,
    expectedEndTime: state.expectedEndTime,
    sessionsCompleted: state.sessionsCompleted,
    
    // Actions
    startTimer,
    pauseTimer,
    resetTimer,
    switchTimer,
    updateTimerState,
    setOnComplete,
    
    // Settings
    settings
  };
}