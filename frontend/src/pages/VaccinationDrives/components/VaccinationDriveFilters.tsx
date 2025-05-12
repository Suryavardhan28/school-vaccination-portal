import {
    Box,
    Button,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    SelectChangeEvent,
    TextField,
    Typography,
} from "@mui/material";
import { ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { primaryButtonHoverSyles } from "../../../common/styles/primaryButtonHover";

interface VaccinationDriveFiltersProps {
    nameFilter: string;
    classFilter: string;
    statusFilter: "all" | "upcoming" | "past";
    upcomingOnly: boolean;
    loading: boolean;
    onFilterChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onClassFilterChange: (e: SelectChangeEvent<string>) => void;
    onStatusFilterChange: (e: SelectChangeEvent<string>) => void;
    onToggleUpcomingFilter: () => void;
    onClearFilters: () => void;
    classOptions: string[];
}

const VaccinationDriveFilters: React.FC<VaccinationDriveFiltersProps> = ({
    nameFilter,
    classFilter,
    statusFilter,
    upcomingOnly,
    loading,
    onFilterChange,
    onClassFilterChange,
    onStatusFilterChange,
    onToggleUpcomingFilter,
    onClearFilters,
    classOptions,
}) => {
    const { t } = useTranslation();

    return (
        <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
                {t("vaccinationDrives.filters")}
            </Typography>

            <Grid container spacing={2} alignItems="center">
                <Grid size={3}>
                    <TextField
                        fullWidth
                        name="nameFilter"
                        label={t("vaccinationDrives.searchByVaccineName")}
                        variant="outlined"
                        size="small"
                        value={nameFilter}
                        onChange={onFilterChange}
                        disabled={loading}
                    />
                </Grid>

                <Grid size={3}>
                    <FormControl fullWidth size="small">
                        <InputLabel id="class-filter-label">
                            {t("vaccinationDrives.searchByClass")}
                        </InputLabel>
                        <Select
                            labelId="class-filter-label"
                            name="classFilter"
                            value={classFilter}
                            label={t("vaccinationDrives.searchByClass")}
                            onChange={onClassFilterChange}
                            disabled={loading}
                            displayEmpty
                        >
                            <MenuItem value="all">
                                <em>{t("vaccinationDrives.allClasses")}</em>
                            </MenuItem>
                            {classOptions.map((cls) => (
                                <MenuItem key={cls} value={cls}>
                                    {t("vaccinationDrives.class")} {cls}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid size={3}>
                    <FormControl fullWidth size="small">
                        <InputLabel>
                            {t("vaccinationDrives.status.title")}
                        </InputLabel>
                        <Select
                            value={statusFilter}
                            label={t("vaccinationDrives.status.title")}
                            onChange={onStatusFilterChange}
                            disabled={loading}
                        >
                            <MenuItem value="all">
                                <em>{t("vaccinationDrives.allDrives")}</em>
                            </MenuItem>
                            <MenuItem value="upcoming">
                                {t("vaccinationDrives.upcomingDrives")}
                            </MenuItem>
                            <MenuItem value="past">
                                {t("vaccinationDrives.pastDrives")}
                            </MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                <Grid size={3}>
                    <Box display="flex" gap={1}>
                        <Button
                            fullWidth
                            variant={upcomingOnly ? "contained" : "outlined"}
                            onClick={onToggleUpcomingFilter}
                            disabled={loading}
                            size="large"
                            sx={primaryButtonHoverSyles}
                        >
                            {t("vaccinationDrives.next30Days")}
                        </Button>

                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={onClearFilters}
                            disabled={
                                loading ||
                                (!nameFilter &&
                                    classFilter === "all" &&
                                    statusFilter === "all" &&
                                    !upcomingOnly)
                            }
                            size="large"
                        >
                            {t("vaccinationDrives.clear")}
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default VaccinationDriveFilters;
