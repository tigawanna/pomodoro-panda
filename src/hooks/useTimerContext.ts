import { useContext } from 'react';
import TimerContext from '../contexts/TimerContext';

export default function useTimerContext() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimerContext must be used within a TimerProvider');
  }
  
  const { 
    state, 
    startBreak, 
    startTimer, 
    pauseTimer, 
    resetTimer,
    switchTimer, 
    setOnComplete,
    settings
  } = context;
  
  return {
    // State properties
    state,

    // Actions
    startBreak,
    startTimer,
    pauseTimer,
    resetTimer,
    switchTimer,
    setOnComplete,

    // Settings
    settings
  };
}