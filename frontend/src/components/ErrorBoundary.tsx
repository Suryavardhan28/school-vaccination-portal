import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      errorInfo
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <FallbackComponent 
          error={this.state.error} 
          resetError={() => this.setState({ hasError: false, error: null, errorInfo: null })} 
        />
      );
    }

    return this.props.children;
  }
}

interface FallbackProps {
  error: Error | null;
  resetError: () => void;
}

const FallbackComponent = ({ error, resetError }: FallbackProps) => {
  // Check if we're in a router context
  const inRouterContext = useIsInRouterContext();
  
  return (
    <Box 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      minHeight="100vh"
      padding={3}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          padding: 4, 
          maxWidth: 600, 
          width: '100%',
          backgroundColor: '#fff8f8'
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom color="error">
          Something went wrong
        </Typography>
        <Typography variant="body1" paragraph>
          An unexpected error has occurred in the application.
        </Typography>
        <Typography variant="body2" component="pre" 
          sx={{ 
            whiteSpace: 'pre-wrap', 
            backgroundColor: '#f5f5f5', 
            padding: 2, 
            borderRadius: 1,
            overflow: 'auto',
            maxHeight: '200px'
          }}
        >
          {error?.message || 'Unknown error'}
        </Typography>
        <Box mt={3} display="flex" gap={2}>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={resetError}
          >
            Try Again
          </Button>
          {inRouterContext && <NavigateHomeButton />}
          {!inRouterContext && (
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => window.location.href = '/'}
            >
              Return to Dashboard
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

// Check if we're in a router context
const useIsInRouterContext = () => {
  try {
    // useLocation will throw an error if not in a router context
    useLocation();
    return true;
  } catch {
    return false;
  }
};

// This component is needed because hooks cannot be used directly in class components
const NavigateHomeButton = () => {
  const navigate = useNavigate();
  return (
    <Button 
      variant="contained" 
      color="primary" 
      onClick={() => navigate('/')}
    >
      Return to Dashboard
    </Button>
  );
};

// Export a component that uses the class component with the navigation hook
const ErrorBoundary = (props: Props) => {
  return <ErrorBoundaryClass {...props} />;
};

export default ErrorBoundary; 