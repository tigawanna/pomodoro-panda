import { useContext } from 'react';
import TimerContext from '../contexts/TimerContext';

const useTimerContext = () => {
    const context = useContext(TimerContext);
    if (!context) {
        throw new Error('useTimerContext must be used within a TimerProvider');
    }
    return context;
};

export default useTimerContext;