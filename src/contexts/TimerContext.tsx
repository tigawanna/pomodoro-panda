import React, {
    createContext,
    useReducer,
    useRef,
    useCallback,
    useEffect,
} from 'react';
import {
    TIMER_TYPES,
    DEFAULT_TIMER_SETTINGS,
} from '../constants/timerConstants';
import type {
    TimerAction,
    TimerContextType,
    TimerState,
    TimerSettings,
} from '../types/timer';

const initialState: TimerState = {
    timeLeft: DEFAULT_TIMER_SETTINGS.workDuration,
    isRunning: false,
    hasStarted: false,
    timerType: TIMER_TYPES.WORK,
    activeTaskId: null,
    startTime: null,
    expectedEndTime: null,
    sessionsCompleted: 0,
};

function timerReducer(state: TimerState, action: TimerAction): TimerState {
    switch (action.type) {
        case 'UPDATE_TIMER_STATE':
            return { ...state, ...action.payload };
        case 'START_TIMER':
            return {
                ...state,
                isRunning: true,
                hasStarted: true,
                startTime: action.payload?.startTime ?? Date.now(),
                expectedEndTime:
                    action.payload?.expectedEndTime ??
                    Date.now() + state.timeLeft * 1000,
            };
        case 'PAUSE_TIMER':
            return {
                ...state,
                isRunning: false,
                // Keep timeLeft as is
            };
        case 'RESET_TIMER':
            return {
                ...initialState,
                timerType: TIMER_TYPES.WORK,
                timeLeft: DEFAULT_TIMER_SETTINGS.workDuration,
            };
        case 'SWITCH_TIMER':
            return {
                ...state,
                timerType: action.payload.timerType,
                timeLeft: action.payload.timeLeft,
                isRunning: false,
                hasStarted: false,
                startTime: null,
                expectedEndTime: null,
                // Increment sessionsCompleted if switching from WORK to a break type
                sessionsCompleted:
                    state.timerType === TIMER_TYPES.WORK &&
                    action.payload.timerType !== TIMER_TYPES.WORK
                        ? state.sessionsCompleted + 1
                        : state.sessionsCompleted,
            };
        case 'UPDATE_TIME_LEFT':
            return {
                ...state,
                timeLeft: action.payload.timeLeft,
            };
        default:
            return state;
    }
}

const TimerContext = createContext<TimerContextType | null>(null);

export const TimerProvider: React.FC<{
    children: React.ReactNode;
    settings?: TimerSettings;
}> = ({ children, settings = DEFAULT_TIMER_SETTINGS }) => {
    const [state, dispatch] = useReducer(timerReducer, {
        ...initialState,
        timeLeft: settings.workDuration,
    });

    // Animation frame reference
    const animationFrameRef = useRef<number | undefined>(undefined);

    // Callback for timer completion
    const onCompleteRef = useRef<((timerType: string) => void) | null>(null);

    // Set callback for timer completion
    const setOnComplete = useCallback(
        (callback: (timerType: string) => void) => {
            onCompleteRef.current = callback;
        },
        []
    );

    // Get next timer type and duration
    const getNextTimer = useCallback(() => {
        if (state.timerType === TIMER_TYPES.WORK) {
            const nextSessions = state.sessionsCompleted + 1;
            if (nextSessions % settings.sessionsUntilLongBreak === 0) {
                return {
                    type: TIMER_TYPES.LONG_BREAK,
                    duration: settings.longBreakDuration,
                };
            }
            return {
                type: TIMER_TYPES.BREAK,
                duration: settings.breakDuration,
            };
        }
        return {
            type: TIMER_TYPES.WORK,
            duration: settings.workDuration,
        };
    }, [state.timerType, state.sessionsCompleted, settings]);

    // Update timer logic
    const updateTimer = useCallback(() => {
        if (!state.isRunning || !state.startTime || !state.expectedEndTime)
            return;

        const now = Date.now();
        const remaining = Math.max(0, state.expectedEndTime - now);
        const newTimeLeft = Math.ceil(remaining / 1000);

        // Only update if time has changed
        if (newTimeLeft !== state.timeLeft) {
            dispatch({
                type: 'UPDATE_TIME_LEFT',
                payload: { timeLeft: newTimeLeft },
            });
        }

        // Check if timer completed
        if (newTimeLeft <= 0) {
            dispatch({ type: 'PAUSE_TIMER' });

            // Call completion callback
            if (onCompleteRef.current) {
                onCompleteRef.current(state.timerType);
            }

            // Get next timer type and duration
            const nextTimer = getNextTimer();
            dispatch({
                type: 'SWITCH_TIMER',
                payload: {
                    timerType: nextTimer.type,
                    timeLeft: nextTimer.duration,
                },
            });

            return;
        }

        // Schedule next update
        animationFrameRef.current = requestAnimationFrame(updateTimer);
    }, [
        state.isRunning,
        state.timeLeft,
        state.startTime,
        state.expectedEndTime,
        state.timerType,
        getNextTimer,
    ]);

    // Start animation frame when running
    useEffect(() => {
        if (state.isRunning) {
            animationFrameRef.current = requestAnimationFrame(updateTimer);
        }

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [state.isRunning, updateTimer]);

    // Action creators
    const startTimer = useCallback(() => {
        const now = Date.now();
        dispatch({
            type: 'START_TIMER',
            payload: {
                startTime: now,
                expectedEndTime: now + state.timeLeft * 1000,
            },
        });
    }, [state.timeLeft]);

    const pauseTimer = useCallback(() => {
        dispatch({ type: 'PAUSE_TIMER' });
    }, []);

    const resetTimer = useCallback(() => {
        dispatch({ type: 'RESET_TIMER' });
    }, []);

    const switchTimer = useCallback(() => {
        const nextTimer = getNextTimer();
        dispatch({
            type: 'SWITCH_TIMER',
            payload: {
                timerType: nextTimer.type,
                timeLeft: nextTimer.duration,
            },
        });
    }, [getNextTimer]);

    const updateTimerState = useCallback((newState: Partial<TimerState>) => {
        dispatch({ type: 'UPDATE_TIMER_STATE', payload: newState });
    }, []);

    const value = {
        state,
        dispatch,
        startTimer,
        pauseTimer,
        resetTimer,
        switchTimer,
        updateTimerState,
        setOnComplete,
        settings,
    };

    return (
        <TimerContext.Provider value={value}>{children}</TimerContext.Provider>
    );
};

export default TimerContext;
