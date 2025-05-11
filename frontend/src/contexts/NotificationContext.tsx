import React, { createContext, ReactNode, useContext, useState } from "react";

// Define notification types
export type NotificationType = "success" | "error" | "info" | "warning";

// Notification interface
export interface Notification {
    message: string;
    type: NotificationType;
    open: boolean;
}

// NotificationContext interface
interface NotificationContextType {
    notification: Notification;
    showNotification: (message: string, type: NotificationType) => void;
    hideNotification: () => void;
}

// Create the context with default values
const NotificationContext = createContext<NotificationContextType>({
    notification: {
        message: "",
        type: "info",
        open: false,
    },
    showNotification: () => {},
    hideNotification: () => {},
});

// Custom hook to use the notification context
export const useNotification = () => useContext(NotificationContext);

// Provider component
export const NotificationProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [notification, setNotification] = useState<Notification>({
        message: "",
        type: "info",
        open: false,
    });

    const showNotification = (message: string, type: NotificationType) => {
        setNotification({
            message,
            type,
            open: true,
        });
    };

    const hideNotification = () => {
        setNotification((prev) => ({
            ...prev,
            open: false,
        }));
    };

    return (
        <NotificationContext.Provider
            value={{
                notification,
                showNotification,
                hideNotification,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};
