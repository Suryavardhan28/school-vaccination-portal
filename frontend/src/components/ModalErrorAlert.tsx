import React from 'react';
import { Alert, SxProps, Theme } from '@mui/material';

interface ModalErrorAlertProps {
  error: string | null;
  sx?: SxProps<Theme>;
}

/**
 * A styled error alert for use in modals
 */
const ModalErrorAlert: React.FC<ModalErrorAlertProps> = ({ error, sx }) => {
  if (!error) return null;

  return (
    <Alert 
      severity="error" 
      sx={{ 
        mb: 2, 
        mt: 1,
        '& .MuiAlert-message': { 
          fontWeight: 500 
        },
        ...sx
      }}
    >
      {error}
    </Alert>
  );
};

export default ModalErrorAlert; 