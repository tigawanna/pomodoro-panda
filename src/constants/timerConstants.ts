export const TIMER_TYPES = {
  WORK: 'work',
  BREAK: 'break',
  LONG_BREAK: 'longBreak'
} as const;

export type TimerType = typeof TIMER_TYPES[keyof typeof TIMER_TYPES];

export const DEFAULT_TIMER_SETTINGS = {
  workDuration: 0.1 * 60,  // 25 minutes
  breakDuration: 5 * 60,  // 5 minutes
  longBreakDuration: 15 * 60,  // 15 minutes
  sessionsUntilLongBreak: 4
} as const;

export const NOTIFICATION_MESSAGES = {
  [TIMER_TYPES.WORK]: "Time to focus!",
  [TIMER_TYPES.BREAK]: "Take a short break!",
  [TIMER_TYPES.LONG_BREAK]: "Time for a long break!"
} as const;