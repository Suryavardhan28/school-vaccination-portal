import React from 'react';
import { Snackbar, Alert, AlertProps } from '@mui/material';
import { useNotification } from '../contexts/NotificationContext';

const Notification: React.FC = () => {
  const { notification, hideNotification } = useNotification();

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    hideNotification();
  };

  const getSeverity = (): AlertProps['severity'] => {
    return notification.type as AlertProps['severity'];
  };

  return (
    <Snackbar
      open={notification.open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert
        onClose={handleClose}
        severity={getSeverity()}
        sx={{ width: '100%' }}
        variant="filled"
      >
        {notification.message}
      </Alert>
    </Snackbar>
  );
};

export default Notification; 