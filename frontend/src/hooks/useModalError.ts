import { useState } from 'react';
import { useNotification } from '../contexts/NotificationContext';

/**
 * Custom hook for handling error states in modals
 * 
 * @returns Object with error state and functions to manage it
 */
export const useModalError = () => {
    const [error, setError] = useState<string | null>(null);
    const { showNotification } = useNotification();

    /**
     * Sets an error message on the modal without showing a notification
     * @param message Error message to display
     */
    const setModalError = (message: string) => {
        setError(message);
    };

    /**
     * Sets an error message and also shows a notification
     * @param message Error message to display
     * @param notificationMessage Optional different message for the notification (if not provided, uses the same message)
     */
    const setModalErrorWithNotification = (message: string, notificationMessage?: string) => {
        setError(message);
        showNotification(notificationMessage || message, 'error');
    };

    /**
     * Clears the error state
     */
    const clearError = () => {
        setError(null);
    };

    return {
        error,
        setModalError,
        setModalErrorWithNotification,
        clearError,
    };
};

export default useModalError; 