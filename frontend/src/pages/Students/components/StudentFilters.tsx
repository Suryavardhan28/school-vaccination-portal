import { Button, Grid, Paper, TextField, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

interface StudentFiltersProps {
    nameFilter: string;
    studentIdFilter: string;
    classFilter: string;
    loading?: boolean;
    onFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClearFilters: () => void;
}

const StudentFilters: React.FC<StudentFiltersProps> = ({
    nameFilter,
    studentIdFilter,
    classFilter,
    loading = false,
    onFilterChange,
    onClearFilters,
}) => {
    const { t } = useTranslation();

    return (
        <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
                {t("students.filters")}
            </Typography>
            <Grid container spacing={2} direction="row">
                <Grid size={3}>
                    <TextField
                        name="nameFilter"
                        label={t("students.searchByName")}
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={nameFilter}
                        onChange={onFilterChange}
                        disabled={loading}
                    />
                </Grid>
                <Grid size={3}>
                    <TextField
                        name="studentIdFilter"
                        label={t("students.searchByStudentId")}
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={studentIdFilter}
                        onChange={onFilterChange}
                        disabled={loading}
                    />
                </Grid>
                <Grid size={3}>
                    <TextField
                        name="classFilter"
                        label={t("students.searchByClass")}
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={classFilter}
                        onChange={onFilterChange}
                        disabled={loading}
                    />
                </Grid>
                <Grid flexGrow={1} />
                <Grid>
                    <Button
                        fullWidth
                        disabled={
                            loading ||
                            (!nameFilter && !studentIdFilter && !classFilter)
                        }
                        variant="outlined"
                        onClick={onClearFilters}
                        size="large"
                    >
                        {t("students.clearFilters")}
                    </Button>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default StudentFilters;
