import {
    Box,
    Card,
    CardContent,
    CardHeader,
    Grid,
    Typography,
    useTheme,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import VaccinationDriveCard, {
    VaccinationDriveData,
} from "../../../components/VaccinationDriveCard";
import { VaccinationStatistics } from "../../../services/vaccinationService";

interface DashboardTablesProps {
    stats: VaccinationStatistics | null;
}

interface DriveData {
    id: number;
    name: string;
    date: string;
    applicableClasses: string;
    availableDoses?: number;
    totalDoses?: number;
    vaccinationsDone?: number;
    isWithin30Days?: boolean;
}

const DashboardTables = ({ stats }: DashboardTablesProps) => {
    const { t } = useTranslation();
    const theme = useTheme();

    const mapDriveToCardData = (
        drive: DriveData,
        type: "upcoming" | "completed"
    ): VaccinationDriveData => {
        const status =
            type === "completed"
                ? "completed"
                : drive.isWithin30Days
                ? "upcoming"
                : "future";

        return {
            id: drive.id.toString(),
            name: drive.name,
            date: drive.date,
            applicableClasses: drive.applicableClasses,
            availableDoses: drive.availableDoses,
            totalDoses: drive.totalDoses,
            vaccinationsDone: drive.vaccinationsDone,
            isWithin30Days: drive.isWithin30Days,
            status,
        };
    };

    return (
        <>
            {/* Upcoming Vaccination Drives */}
            <Card
                sx={{
                    mt: 4,
                    bgcolor: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                    border: "none",
                    boxShadow: 3,
                }}
            >
                <CardHeader
                    title={t("dashboard.upcomingVaccinationDrives")}
                    sx={{
                        bgcolor: theme.palette.background.paper,
                        color: theme.palette.text.primary,
                        borderBottom: "2px solid",
                        borderColor: theme.palette.primary.main,
                    }}
                    action={
                        <Typography
                            variant="body2"
                            fontWeight={"600"}
                            sx={{
                                color: theme.palette.primary.main,
                                mr: 2,
                                mt: 1,
                            }}
                        >
                            {t("dashboard.totalDrives")}{" "}
                            {stats?.upcomingDrives?.length || 0}
                        </Typography>
                    }
                />
                <CardContent>
                    {stats?.upcomingDrives &&
                    stats.upcomingDrives.length > 0 ? (
                        <Box>
                            <Grid container spacing={2}>
                                {stats.upcomingDrives.map((drive) => (
                                    <Grid size={4} key={drive.id}>
                                        <VaccinationDriveCard
                                            drive={mapDriveToCardData(
                                                drive,
                                                "upcoming"
                                            )}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    ) : (
                        <Typography
                            variant="body1"
                            align="center"
                            sx={{ py: 4, color: theme.palette.text.primary }}
                        >
                            {t("dashboard.noUpcomingDrives")}
                        </Typography>
                    )}
                </CardContent>
            </Card>

            {/* Completed Vaccination Drives */}
            <Card
                sx={{
                    mt: 4,
                    bgcolor: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                    border: "none",
                    boxShadow: 3,
                }}
            >
                <CardHeader
                    title={t("dashboard.completedVaccinationDrives")}
                    sx={{
                        bgcolor: theme.palette.background.paper,
                        color: theme.palette.text.primary,
                        borderBottom: "2px solid",
                        borderColor: theme.palette.primary.main,
                    }}
                    action={
                        <Typography
                            variant="body2"
                            fontWeight={"600"}
                            sx={{
                                color: theme.palette.primary.main,
                                mr: 2,
                                mt: 1,
                            }}
                        >
                            {t("dashboard.totalCompletedDrives")}{" "}
                            {stats?.completedDrives?.length || 0}
                        </Typography>
                    }
                />
                <CardContent>
                    {stats?.completedDrives &&
                    stats.completedDrives.length > 0 ? (
                        <Box>
                            <Grid container spacing={2}>
                                {stats.completedDrives.map((drive) => (
                                    <Grid size={4} key={drive.id}>
                                        <VaccinationDriveCard
                                            drive={mapDriveToCardData(
                                                drive,
                                                "completed"
                                            )}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    ) : (
                        <Typography
                            variant="body1"
                            align="center"
                            sx={{ py: 4, color: theme.palette.text.primary }}
                        >
                            {t("dashboard.noCompletedDrives")}
                        </Typography>
                    )}
                </CardContent>
            </Card>
        </>
    );
};

export default DashboardTables;
