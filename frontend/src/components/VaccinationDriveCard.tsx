import { Box, Chip, Paper, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

export interface VaccinationDriveData {
    id: string;
    name: string;
    date: string;
    applicableClasses: string;
    availableDoses?: number;
    totalDoses?: number;
    vaccinationsDone?: number;
    isWithin30Days?: boolean;
    status: "upcoming" | "completed" | "future";
}

interface VaccinationDriveCardProps {
    drive: VaccinationDriveData;
}

const VaccinationDriveCard = ({ drive }: VaccinationDriveCardProps) => {
    const { t } = useTranslation();

    const getStatusConfig = (status: VaccinationDriveData["status"]) => {
        switch (status) {
            case "upcoming":
                return {
                    bgColor: "#0d47a1",
                    chipColor: "#1976d2",
                    label: "Within 30 days",
                };
            case "future":
                return {
                    bgColor: "#424242",
                    chipColor: "#757575",
                    label: "Future drive",
                };
            case "completed":
                return {
                    bgColor: "#1b5e20",
                    chipColor: "#43a047",
                    label: "Completed",
                };
            default:
                return {
                    bgColor: "#424242",
                    chipColor: "#757575",
                    label: "Unknown",
                };
        }
    };

    const statusConfig = getStatusConfig(drive.status);

    return (
        <Paper
            elevation={2}
            sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: statusConfig.bgColor,
                color: "#fff",
                border: "none",
                boxShadow: 2,
                position: "relative",
                height: "100%",
            }}
        >
            <Box
                sx={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                }}
            >
                <Chip
                    size="small"
                    label={statusConfig.label}
                    sx={{
                        bgcolor: statusConfig.chipColor,
                        color: "#fff",
                        fontSize: "0.7rem",
                        height: 22,
                        fontWeight: "bold",
                    }}
                />
            </Box>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                }}
            >
                <Typography variant="h6" sx={{ color: "#fff", pr: 8 }}>
                    {drive.name}
                </Typography>
                <Typography variant="body1" sx={{ color: "#fff" }}>
                    {t("dashboard.date")}:{" "}
                    {new Date(drive.date).toLocaleDateString()}
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {drive.availableDoses !== undefined && (
                        <Chip
                            size="small"
                            label={`${t("dashboard.availableDoses")}: ${
                                drive.availableDoses
                            }`}
                            sx={{
                                bgcolor: "rgba(255, 255, 255, 0.2)",
                                color: "#fff",
                                fontSize: "0.8rem",
                                height: 24,
                            }}
                        />
                    )}
                    {drive.totalDoses !== undefined && (
                        <Chip
                            size="small"
                            label={`${t("dashboard.totalDoses")}: ${
                                drive.totalDoses
                            }`}
                            sx={{
                                bgcolor: "rgba(255, 255, 255, 0.2)",
                                color: "#fff",
                                fontSize: "0.8rem",
                                height: 24,
                            }}
                        />
                    )}
                    {drive.vaccinationsDone !== undefined && (
                        <Chip
                            size="small"
                            label={`${t("dashboard.vaccinationsDone")}: ${
                                drive.vaccinationsDone
                            }`}
                            sx={{
                                bgcolor: "rgba(255, 255, 255, 0.2)",
                                color: "#fff",
                                fontSize: "0.8rem",
                                height: 24,
                            }}
                        />
                    )}
                </Box>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    <Typography
                        variant="body2"
                        sx={{ color: "#fff", mr: 1, alignSelf: "center" }}
                    >
                        {t("dashboard.classes")}:
                    </Typography>
                    {drive.applicableClasses.split(",").map((cls, index) => (
                        <Chip
                            key={index}
                            size="small"
                            label={cls.trim()}
                            sx={{
                                bgcolor: "rgba(255, 255, 255, 0.2)",
                                color: "#fff",
                                fontSize: "0.8rem",
                                height: 24,
                            }}
                        />
                    ))}
                </Box>
            </Box>
        </Paper>
    );
};

export default VaccinationDriveCard;
