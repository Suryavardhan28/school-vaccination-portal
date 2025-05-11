import { AppBar, Box, Button, Grid, Toolbar, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "../hooks/useTranslation";

const hoverStyle = {
    color: "primary.main",
    borderBottom: "2px solid",
    borderColor: "primary.main",
    borderRadius: "0",
    backgroundColor: "transparent",
};

const defaultStyle = {
    fontWeight: "bold",
    borderRadius: "0",
    borderColor: "primary.main",
    "&:hover": hoverStyle,
};

const Navbar = () => {
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    const [selectedItem, setSelectedItem] = useState<string>("");
    const location = useLocation();

    // update selection based on location path
    useEffect(() => {
        const path = location.pathname;
        if (path === "/") {
            setSelectedItem("dashboard");
        } else if (path === "/students") {
            setSelectedItem("students");
        } else if (path === "/vaccination-drives") {
            setSelectedItem("vaccination-drives");
        } else if (path === "/vaccinations") {
            setSelectedItem("vaccinations");
        } else if (path === "/reports") {
            setSelectedItem("reports");
        } else if (path === "/users") {
            setSelectedItem("users");
        }
    }, [location]);

    if (!user) {
        return <></>;
    }

    return (
        <AppBar position="static" color="default" elevation={1}>
            <Toolbar>
                <Grid
                    container
                    alignItems="center"
                    justifyContent="space-between"
                    width="100%"
                >
                    <Grid>
                        <Typography
                            variant="h6"
                            component={Link}
                            to="/"
                            sx={{
                                textDecoration: "none",
                                color: "primary.main",
                                fontWeight: "bold",
                            }}
                        >
                            {t("navigation.title").toUpperCase()}
                        </Typography>
                    </Grid>

                    <Grid>
                        <Box sx={{ display: "flex", gap: 2 }}>
                            <Button
                                component={Link}
                                to="/students"
                                color="inherit"
                                sx={{
                                    borderRadius: "0",
                                    fontWeight: "bold",
                                    color:
                                        selectedItem === "students"
                                            ? "primary.main"
                                            : "inherit",
                                    borderBottom:
                                        selectedItem === "students"
                                            ? "2px solid"
                                            : "none",
                                    borderColor: "primary.main",
                                    "&:hover": hoverStyle,
                                }}
                            >
                                {t("navigation.students")}
                            </Button>
                            {/* Users button for admin only */}
                            {user?.role === "admin" && (
                                <Button
                                    component={Link}
                                    to="/users"
                                    color="inherit"
                                    sx={{
                                        ...defaultStyle,
                                        color:
                                            selectedItem === "users"
                                                ? "primary.main"
                                                : "inherit",
                                        borderBottom:
                                            selectedItem === "users"
                                                ? "2px solid"
                                                : "none",
                                    }}
                                >
                                    {t("navigation.users")}
                                </Button>
                            )}
                            <Button
                                component={Link}
                                to="/vaccination-drives"
                                color="inherit"
                                sx={{
                                    ...defaultStyle,
                                    color:
                                        selectedItem === "vaccination-drives"
                                            ? "primary.main"
                                            : "inherit",
                                    borderBottom:
                                        selectedItem === "vaccination-drives"
                                            ? "2px solid"
                                            : "none",
                                }}
                            >
                                {t("navigation.vaccinationDrives")}
                            </Button>
                            <Button
                                component={Link}
                                to="/vaccinations"
                                color="inherit"
                                sx={{
                                    ...defaultStyle,
                                    color:
                                        selectedItem === "vaccinations"
                                            ? "primary.main"
                                            : "inherit",
                                    borderBottom:
                                        selectedItem === "vaccinations"
                                            ? "2px solid"
                                            : "none",
                                }}
                            >
                                {t("navigation.vaccinations")}
                            </Button>
                            <Button
                                component={Link}
                                to="/reports"
                                color="inherit"
                                sx={{
                                    ...defaultStyle,
                                    color:
                                        selectedItem === "reports"
                                            ? "primary.main"
                                            : "inherit",
                                    borderBottom:
                                        selectedItem === "reports"
                                            ? "2px solid"
                                            : "none",
                                }}
                            >
                                {t("navigation.reports")}
                            </Button>
                            <Button
                                onClick={logout}
                                color="inherit"
                                sx={defaultStyle}
                            >
                                {t("auth.logout")}
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
