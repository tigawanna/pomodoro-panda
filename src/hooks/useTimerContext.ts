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
    state,

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