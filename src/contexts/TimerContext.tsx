import React, { createContext, useState } from 'react';
import { TIMER_TYPES, TimerType } from '../constants/timerConstants';
import { TimerContextState } from '../types/timer';

interface TimerContextType {
  timeLeft: number;
  isRunning: boolean;
  hasStarted: boolean;
  timerType: TimerType;
  activeTaskId: string | null;
  startTime: number | null;
  expectedEndTime: number | null;
  updateTimerState: (state: Partial<TimerContextType>) => void;
}

const TimerContext = createContext<TimerContextType | null>(null);

// Define a specific type for updates
type TimerStateUpdate = Partial<Omit<TimerContextState, 'updateTimerState'>>;

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [timerState, setTimerState] = useState<Omit<TimerContextState, 'updateTimerState'>>({
    timeLeft: 0,
    isRunning: false,
    hasStarted: false,
    timerType: TIMER_TYPES.WORK,
    activeTaskId: null,
    startTime: null,
    expectedEndTime: null,
  });

  const updateTimerState = (newState: TimerStateUpdate) => {
    setTimerState(prev => ({ ...prev, ...newState }));
  };

  return (
    <TimerContext.Provider value={{ ...timerState, updateTimerState }}>
      {children}
    </TimerContext.Provider>
  );
};

export default TimerContext;