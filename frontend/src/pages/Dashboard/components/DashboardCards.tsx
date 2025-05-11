import { Event, People, School, Vaccines } from "@mui/icons-material";
import {
    Box,
    Grid,
    LinearProgress,
    Paper,
    Typography,
    useTheme,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { VaccinationStatistics } from "../../../services/vaccinationService";

interface DashboardCardsProps {
    stats: VaccinationStatistics | null;
}

const DashboardCards = ({ stats }: DashboardCardsProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const theme = useTheme();

    return (
        <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Total Students Card */}
            <Grid size={3}>
                <Paper
                    elevation={3}
                    onClick={() => navigate("/students")}
                    sx={{
                        p: 2,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        height: "100%",
                        bgcolor: theme.palette.custom.blue,
                        borderRadius: 2,
                        cursor: "pointer",
                        color: "#fff",
                        boxShadow: 3,
                        border: "none",
                        "&:hover": {
                            bgcolor: theme.palette.custom.blueHover,
                        },
                    }}
                >
                    <School sx={{ fontSize: 40, mb: 1, color: "#fff" }} />
                    <Typography
                        variant="h6"
                        gutterBottom
                        align="center"
                        sx={{ color: "#fff" }}
                    >
                        {t("dashboard.totalStudents")}
                    </Typography>
                    <Typography
                        variant="h3"
                        component="div"
                        align="center"
                        sx={{ color: "#fff" }}
                    >
                        {stats?.totalStudents || 0}
                    </Typography>
                </Paper>
            </Grid>

            {/* Vaccinated Students Card */}
            <Grid size={3}>
                <Paper
                    elevation={3}
                    onClick={() => navigate("/vaccinations")}
                    sx={{
                        p: 2,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        height: "100%",
                        bgcolor: theme.palette.custom.green,
                        borderRadius: 2,
                        cursor: "pointer",
                        color: "#fff",
                        boxShadow: 3,
                        border: "none",
                        "&:hover": {
                            bgcolor: theme.palette.custom.greenHover,
                        },
                    }}
                >
                    <People sx={{ fontSize: 40, mb: 1, color: "#fff" }} />
                    <Typography
                        variant="h6"
                        gutterBottom
                        align="center"
                        sx={{ color: "#fff" }}
                    >
                        {t("dashboard.vaccinatedStudents")}
                    </Typography>
                    <Typography
                        variant="h3"
                        component="div"
                        align="center"
                        sx={{ color: "#fff" }}
                    >
                        {stats?.vaccinatedStudents || 0}
                    </Typography>
                </Paper>
            </Grid>

            {/* Vaccination Percentage Card */}
            <Grid size={3}>
                <Paper
                    elevation={3}
                    sx={{
                        p: 2,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        height: "100%",
                        bgcolor: theme.palette.custom.purple,
                        borderRadius: 2,
                        color: "#fff",
                        boxShadow: 3,
                        border: "none",
                    }}
                >
                    <Vaccines sx={{ fontSize: 40, mb: 1, color: "#fff" }} />
                    <Typography
                        variant="h6"
                        gutterBottom
                        align="center"
                        sx={{ color: "#fff" }}
                    >
                        {t("dashboard.vaccinationRate")}
                    </Typography>
                    <Typography
                        variant="h3"
                        component="div"
                        align="center"
                        sx={{ color: "#fff" }}
                    >
                        {stats?.vaccinationPercentage || 0}%
                    </Typography>
                    <Box sx={{ width: "100%", mt: 1 }}>
                        <LinearProgress
                            variant="determinate"
                            value={stats?.vaccinationPercentage || 0}
                            sx={{
                                height: 10,
                                borderRadius: 5,
                                backgroundColor: "rgba(255,255,255,0.2)",
                                "& .MuiLinearProgress-bar": {
                                    backgroundColor: "#fff",
                                },
                            }}
                        />
                    </Box>
                </Paper>
            </Grid>

            {/* Upcoming Drives Card */}
            <Grid size={3}>
                <Paper
                    elevation={3}
                    onClick={() =>
                        navigate("/vaccination-drives?upcoming=true")
                    }
                    sx={{
                        p: 2,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        height: "100%",
                        bgcolor: theme.palette.custom.yellow,
                        borderRadius: 2,
                        cursor: "pointer",
                        color: "#fff",
                        boxShadow: 3,
                        border: "none",
                        "&:hover": {
                            bgcolor: theme.palette.custom.yellowHover,
                        },
                    }}
                >
                    <Event sx={{ fontSize: 40, mb: 1, color: "#fff" }} />
                    <Typography
                        variant="h6"
                        gutterBottom
                        align="center"
                        sx={{ color: "#fff" }}
                    >
                        {t("dashboard.upcomingDrives")}
                    </Typography>
                    <Typography
                        variant="h3"
                        component="div"
                        align="center"
                        sx={{ color: "#fff" }}
                    >
                        {stats?.upcomingDrives?.length || 0}
                    </Typography>
                </Paper>
            </Grid>
        </Grid>
    );
};

export default DashboardCards;
