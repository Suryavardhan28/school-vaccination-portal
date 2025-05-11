import { Visibility, VisibilityOff } from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";
import {
    Alert,
    Box,
    IconButton,
    InputAdornment,
    Paper,
    TextField,
    Typography,
    useTheme,
} from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.svg";
import { useAuth } from "../../contexts/AuthContext";
import { useNotification } from "../../contexts/NotificationContext";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { showNotification } = useNotification();
    const { login } = useAuth();
    const theme = useTheme();

    const handleClickShowPassword = () => {
        setShowPassword((show) => !show);
    };

    const handleMouseDownPassword = (
        event: React.MouseEvent<HTMLButtonElement>
    ) => {
        event.preventDefault();
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await login(username, password);
            showNotification(t("login.loginSuccessful"), "success");
            navigate("/");
        } catch (err: unknown) {
            console.error("Login error:", err);
            if (
                err &&
                typeof err === "object" &&
                "response" in err &&
                err.response &&
                typeof err.response === "object" &&
                "data" in err.response &&
                err.response.data &&
                typeof err.response.data === "object" &&
                "message" in err.response.data
            ) {
                const errorMessage = err.response.data.message as string;
                setError(errorMessage);
                showNotification(errorMessage, "error");
            } else {
                const errorMessage = t("login.loginError");
                setError(errorMessage);
                showNotification(errorMessage, "error");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                display: "flex",
                minHeight: "100vh",
                bgcolor: theme.palette.background.default,
            }}
        >
            {/* Left side - Branding */}
            <Box
                sx={{
                    flex: 1,
                    display: { xs: "none", md: "flex" },
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    bgcolor: theme.palette.primary.main,
                    p: 8,
                    position: "relative",
                }}
            >
                <Box
                    component="img"
                    src={logo}
                    alt="Logo"
                    sx={{
                        width: "200px",
                        height: "200px",
                    }}
                />
                <Box sx={{ maxWidth: "600px" }}>
                    <Typography
                        variant="h1"
                        component="h1"
                        sx={{
                            color: theme.palette.primary.contrastText,
                            fontWeight: 700,
                            textAlign: "left",
                            mb: 2,
                            fontSize: { md: "4rem", lg: "5rem" },
                            lineHeight: 1.2,
                        }}
                    >
                        {t("login.school")}
                    </Typography>
                    <Typography
                        variant="h1"
                        component="h1"
                        sx={{
                            color: theme.palette.primary.contrastText,
                            fontWeight: 700,
                            textAlign: "left",
                            mb: 2,
                            fontSize: { md: "4rem", lg: "5rem" },
                            lineHeight: 1.2,
                        }}
                    >
                        {t("login.vaccination")}
                    </Typography>
                    <Typography
                        variant="h1"
                        component="h1"
                        sx={{
                            color: theme.palette.primary.contrastText,
                            fontWeight: 700,
                            textAlign: "left",
                            mb: 4,
                            fontSize: { md: "4rem", lg: "5rem" },
                            lineHeight: 1.2,
                        }}
                    >
                        {t("login.portal")}
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            color: theme.palette.primary.contrastText,
                            opacity: 0.8,
                            textAlign: "left",
                            maxWidth: "600px",
                        }}
                    >
                        {t("login.subtitle")}
                    </Typography>
                </Box>
            </Box>

            {/* Right side - Login Form */}
            <Box
                sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    p: { xs: 2, sm: 4, md: 8 },
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        width: "60%",
                        p: { xs: 3, sm: 4, md: 6 },
                        bgcolor: theme.palette.background.paper,
                        borderRadius: 2,
                    }}
                >
                    <Typography
                        variant="h4"
                        component="h1"
                        align="center"
                        gutterBottom
                        sx={{ color: theme.palette.text.primary }}
                    >
                        {t("login.title")}
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        noValidate
                        sx={{ mt: 3 }}
                    >
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Username"
                            name="username"
                            autoComplete="username"
                            autoFocus
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={loading}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    "& fieldset": {
                                        borderColor: theme.palette.primary.main,
                                    },
                                    "&:hover fieldset": {
                                        borderColor:
                                            theme.palette.primary.light,
                                    },
                                },
                            }}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type={showPassword ? "text" : "password"}
                            id="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleClickShowPassword}
                                            onMouseDown={
                                                handleMouseDownPassword
                                            }
                                            edge="end"
                                        >
                                            {showPassword ? (
                                                <VisibilityOff />
                                            ) : (
                                                <Visibility />
                                            )}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    "& fieldset": {
                                        borderColor: theme.palette.primary.main,
                                    },
                                    "&:hover fieldset": {
                                        borderColor:
                                            theme.palette.primary.light,
                                    },
                                },
                            }}
                        />
                        <LoadingButton
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{
                                mt: 3,
                                mb: 2,
                                height: 48,
                                bgcolor: theme.palette.primary.main,
                                "&:hover": {
                                    bgcolor: theme.palette.primary.dark,
                                },
                            }}
                            loading={loading}
                            disabled={!username || !password}
                        >
                            {t("login.signIn")}
                        </LoadingButton>

                        <Box
                            sx={{
                                mt: 2,
                                p: 2,
                                bgcolor: theme.palette.background.default,
                                borderRadius: 1,
                                border: `1px solid ${theme.palette.primary.main}`,
                            }}
                        >
                            <Typography
                                variant="body2"
                                align="center"
                                sx={{ color: theme.palette.text.primary }}
                            >
                                <strong>{t("login.demoCredentials")}</strong>
                                <br />
                                {t("login.username")}: admin
                                <br />
                                {t("login.password")}: password123
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
};

export default Login;
