import { Download } from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";
import { Box, Paper, Stack, Typography, useTheme } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface ReportCardProps {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    onDownload: () => Promise<void>;
}

const ReportCard = ({
    title,
    description,
    icon,
    onDownload,
}: ReportCardProps) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const theme = useTheme();

    const handleDownload = async () => {
        setLoading(true);
        try {
            await onDownload();
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper
            elevation={4}
            sx={{
                p: 4,
                borderRadius: 3,
                minWidth: 300,
                maxWidth: 400,
                mx: "auto",
                color: "#fff",
                boxShadow: 3,
                border: "none",
                transition: "background 0.2s",
            }}
        >
            <Stack spacing={2} alignItems="center">
                {icon && <Box sx={{ fontSize: 48, color: "#fff" }}>{icon}</Box>}
                <Typography
                    variant="h6"
                    fontWeight={700}
                    align="center"
                    sx={{ color: "#fff" }}
                >
                    {title}
                </Typography>
                {description && (
                    <Typography
                        variant="body2"
                        color="#fff"
                        align="center"
                        sx={{ opacity: 0.85 }}
                    >
                        {description}
                    </Typography>
                )}
                <LoadingButton
                    variant="contained"
                    color="primary"
                    onClick={handleDownload}
                    loading={loading}
                    loadingPosition="start"
                    startIcon={<Download />}
                    sx={{
                        minWidth: 180,
                        fontWeight: 600,
                        fontSize: 16,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                        background: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                        "&:hover": {
                            background: theme.palette.primary.dark,
                        },
                    }}
                >
                    {t("reports.generateReport")}
                </LoadingButton>
            </Stack>
        </Paper>
    );
};

export default ReportCard;
