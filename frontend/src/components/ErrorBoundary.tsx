import { Box, Button, Paper, Typography } from "@mui/material";
import { Component, ErrorInfo, ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "../hooks/useTranslation";

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
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI
        return {
            hasError: true,
            error,
            errorInfo: null,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        // Log the error to an error reporting service
        console.error("ErrorBoundary caught an error:", error, errorInfo);
        this.setState({
            errorInfo,
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
                    resetError={() =>
                        this.setState({
                            hasError: false,
                            error: null,
                            errorInfo: null,
                        })
                    }
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
    const { t } = useTranslation();

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
                    width: "100%",
                    backgroundColor: "#fff8f8",
                }}
            >
                <Typography
                    variant="h4"
                    component="h1"
                    gutterBottom
                    color="error"
                >
                    {t("error.title")}
                </Typography>
                <Typography variant="body1" paragraph>
                    {t("error.description")}
                </Typography>
                <Typography
                    variant="body2"
                    component="pre"
                    sx={{
                        whiteSpace: "pre-wrap",
                        backgroundColor: "#f5f5f5",
                        padding: 2,
                        borderRadius: 1,
                        overflow: "auto",
                        maxHeight: "200px",
                    }}
                >
                    {error?.message || t("error.unknown")}
                </Typography>
                <Box mt={3} display="flex" gap={2}>
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={resetError}
                    >
                        {t("error.tryAgain")}
                    </Button>
                    {inRouterContext && <NavigateHomeButton />}
                    {!inRouterContext && (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => (window.location.href = "/")}
                        >
                            {t("error.returnToDashboard")}
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
    const { t } = useTranslation();

    return (
        <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/")}
        >
            {t("error.returnToDashboard")}
        </Button>
    );
};

// Export a component that uses the class component with the navigation hook
const ErrorBoundary = (props: Props) => {
    return <ErrorBoundaryClass {...props} />;
};

export default ErrorBoundary;
