export interface NotificationProps {
    message: string;
    duration?: number;
    type?: 'error' | 'success' | 'info';
    onClose?: () => void;
  }
  
  export interface NotificationState {
    message: string;
    type: 'error' | 'success' | 'info';
  }