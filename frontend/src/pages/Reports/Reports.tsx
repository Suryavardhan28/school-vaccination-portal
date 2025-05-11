import EventNoteIcon from "@mui/icons-material/EventNote";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import SchoolIcon from "@mui/icons-material/School";
import VaccinesIcon from "@mui/icons-material/Vaccines";
import { Container, Grid, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import {
    downloadClassWiseReport,
    downloadDriveSummaryReport,
    downloadUnvaccinatedReport,
    downloadVaccinationReport,
} from "../../services/reportService";
import ReportCard from "./components/ReportCard";

const Reports = () => {
    const { t } = useTranslation();

    const handleDownload = async (
        downloadFn: () => Promise<Blob>,
        filename: string
    ) => {
        const blob = await downloadFn();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    return (
        <Container sx={{ py: 2 }}>
            <Typography
                variant="h4"
                gutterBottom
                fontWeight={700}
                align="center"
                color="primary.main"
            >
                {t("reports.title")}
            </Typography>
            <Typography
                variant="subtitle1"
                align="center"
                color="text.secondary"
                sx={{ mb: 3 }}
            >
                {t("reports.description")}
            </Typography>
            <Grid container spacing={2} my={2} justifyContent="center">
                <Grid size={5}>
                    <ReportCard
                        title={t("reports.reportTypes.vaccinationStatus")}
                        description={t(
                            "reports.descriptions.vaccinationStatus"
                        )}
                        icon={<VaccinesIcon fontSize="inherit" />}
                        onDownload={() =>
                            handleDownload(
                                downloadVaccinationReport,
                                `Vaccination_Status_Report_${
                                    new Date().toISOString().split("T")[0]
                                }.xlsx`
                            )
                        }
                    />
                </Grid>
                <Grid size={5}>
                    <ReportCard
                        title={t("reports.reportTypes.classWise")}
                        description={t("reports.descriptions.classWise")}
                        icon={<SchoolIcon fontSize="inherit" />}
                        onDownload={() =>
                            handleDownload(
                                downloadClassWiseReport,
                                `Class_Wise_Report_${
                                    new Date().toISOString().split("T")[0]
                                }.xlsx`
                            )
                        }
                    />
                </Grid>
            </Grid>
            <Grid container spacing={2} my={2} justifyContent="center">
                <Grid size={5}>
                    <ReportCard
                        title={t("reports.reportTypes.driveSummary")}
                        description={t("reports.descriptions.driveSummary")}
                        icon={<EventNoteIcon fontSize="inherit" />}
                        onDownload={() =>
                            handleDownload(
                                downloadDriveSummaryReport,
                                `Drive_Summary_Report_${
                                    new Date().toISOString().split("T")[0]
                                }.xlsx`
                            )
                        }
                    />
                </Grid>
                <Grid size={5}>
                    <ReportCard
                        title={t("reports.reportTypes.unvaccinated")}
                        description={t("reports.descriptions.unvaccinated")}
                        icon={<PersonOffIcon fontSize="inherit" />}
                        onDownload={() =>
                            handleDownload(
                                downloadUnvaccinatedReport,
                                `Unvaccinated_Students_Report_${
                                    new Date().toISOString().split("T")[0]
                                }.xlsx`
                            )
                        }
                    />
                </Grid>
            </Grid>
        </Container>
    );
};

export default Reports;
