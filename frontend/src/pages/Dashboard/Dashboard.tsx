import { Download } from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";
import { Box, Container, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { primaryButtonHoverSyles } from "../../common/styles/primaryButtonHover";
import { downloadVaccinationReport } from "../../services/reportService";
import {
    getVaccinationStatistics,
    VaccinationStatistics,
} from "../../services/vaccinationService";
import DashboardCards from "./components/DashboardCards";
import DashboardSkeleton from "./components/DashboardSkeleton";
import DashboardTables from "./components/DashboardTables";

const Dashboard = () => {
    const { t } = useTranslation();
    const [stats, setStats] = useState<VaccinationStatistics | null>(null);
    const [loading, setLoading] = useState(true);
    const [downloadingReport, setDownloadingReport] = useState(false);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const data = await getVaccinationStatistics();
            setStats(data);
        } catch (error) {
            console.error("Error fetching statistics:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReport = async () => {
        setDownloadingReport(true);
        try {
            const blob = await downloadVaccinationReport();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `Vaccination_Report_${
                new Date().toISOString().split("T")[0]
            }.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading report:", error);
        } finally {
            setDownloadingReport(false);
        }
    };

    if (loading) {
        return (
            <Container maxWidth="xl">
                <Box sx={{ py: 4 }}>
                    <DashboardSkeleton />
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl">
            <Box sx={{ py: 2 }}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                    }}
                >
                    <Typography
                        variant="h4"
                        component="h1"
                        sx={{ color: "#fff" }}
                    >
                        {t("dashboard.title")}
                    </Typography>
                    <LoadingButton
                        variant="contained"
                        startIcon={<Download />}
                        onClick={handleDownloadReport}
                        color="primary"
                        title="Download complete report with all vaccination statistics and records"
                        loading={downloadingReport}
                        loadingPosition="start"
                        sx={primaryButtonHoverSyles}
                    >
                        {t("dashboard.downloadReport")}
                    </LoadingButton>
                </Box>

                <DashboardCards stats={stats} />

                <DashboardTables stats={stats} />
            </Box>
        </Container>
    );
};

export default Dashboard;
