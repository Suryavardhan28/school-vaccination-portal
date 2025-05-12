import {
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
import React from "react";
import { useTranslation } from "react-i18next";

interface StudentFiltersProps {
    nameFilter: string;
    studentIdFilter: string;
    classFilter: string;
    loading?: boolean;
    onFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSelectChange: (e: SelectChangeEvent<string>) => void;
    onClearFilters: () => void;
}

// Add class options
const CLASS_OPTIONS = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
];

const StudentFilters: React.FC<StudentFiltersProps> = ({
    nameFilter,
    studentIdFilter,
    classFilter,
    loading = false,
    onFilterChange,
    onSelectChange,
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
                    <FormControl fullWidth size="small">
                        <InputLabel id="class-filter-label">
                            {t("students.searchByClass")}
                        </InputLabel>
                        <Select
                            labelId="class-filter-label"
                            name="classFilter"
                            value={classFilter}
                            label={t("students.searchByClass")}
                            onChange={onSelectChange}
                            disabled={loading}
                        >
                            <MenuItem value="all">
                                <em>{t("students.allClasses")}</em>
                            </MenuItem>
                            {CLASS_OPTIONS.map((cls) => (
                                <MenuItem key={cls} value={cls}>
                                    {t("students.class")} {cls}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid flexGrow={1} />
                <Grid>
                    <Button
                        fullWidth
                        disabled={
                            loading ||
                            (!nameFilter &&
                                !studentIdFilter &&
                                classFilter === "all")
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
