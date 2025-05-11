import { Box, CssBaseline, ThemeProvider } from "@mui/material";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import "./i18n/i18n";
import AppRoutes from "./routes";
import theme from "./theme";

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <AuthProvider>
                    <Box>
                        <AppRoutes />
                    </Box>
                </AuthProvider>
            </Router>
        </ThemeProvider>
    );
}

export default App;
