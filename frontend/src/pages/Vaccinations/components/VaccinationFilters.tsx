import {
    Box,
    Button,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    TextField,
    Typography,
} from "@mui/material";
import { ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { VaccinationDrive } from "../../../services/vaccinationDriveService";

interface VaccinationFiltersProps {
    studentIdFilter: string;
    studentNameFilter: string;
    vaccineNameFilter: string;
    classFilter: string;
    classes: string[];
    drives: VaccinationDrive[];
    loading: boolean;
    onFilterChange: (
        studentId: string,
        studentName: string,
        vaccineName: string,
        classFilter: string
    ) => void;
}

const VaccinationFilters: React.FC<VaccinationFiltersProps> = ({
    studentIdFilter,
    studentNameFilter,
    vaccineNameFilter,
    classFilter,
    classes,
    drives,
    loading,
    onFilterChange,
}) => {
    const { t } = useTranslation();

    const handleStudentIdChange = (e: ChangeEvent<HTMLInputElement>) => {
        onFilterChange(
            e.target.value,
            studentNameFilter,
            vaccineNameFilter,
            classFilter
        );
    };

    const handleStudentNameChange = (e: ChangeEvent<HTMLInputElement>) => {
        onFilterChange(
            studentIdFilter,
            e.target.value,
            vaccineNameFilter,
            classFilter
        );
    };

    const handleVaccineNameChange = (e: SelectChangeEvent<string>) => {
        onFilterChange(
            studentIdFilter,
            studentNameFilter,
            e.target.value,
            classFilter
        );
    };

    const handleClassChange = (e: SelectChangeEvent<string>) => {
        onFilterChange(
            studentIdFilter,
            studentNameFilter,
            vaccineNameFilter,
            e.target.value
        );
    };

    const handleClearFilters = () => {
        onFilterChange("", "", "all", "all");
    };

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                {t("vaccinations.filters")}
            </Typography>
            <Grid container spacing={2} alignItems="center">
                <Grid size={3}>
                    <TextField
                        fullWidth
                        name="studentIdFilter"
                        label={t("vaccinations.studentId")}
                        value={studentIdFilter}
                        onChange={handleStudentIdChange}
                        size="small"
                        disabled={loading}
                    />
                </Grid>
                <Grid size={3}>
                    <TextField
                        fullWidth
                        name="studentNameFilter"
                        label={t("vaccinations.studentName")}
                        value={studentNameFilter}
                        onChange={handleStudentNameChange}
                        size="small"
                        disabled={loading}
                    />
                </Grid>
                <Grid size={2}>
                    <FormControl fullWidth size="small">
                        <InputLabel>{t("vaccinations.vaccineName")}</InputLabel>
                        <Select
                            value={vaccineNameFilter}
                            onChange={handleVaccineNameChange}
                            label={t("vaccinations.vaccineName")}
                            disabled={loading}
                        >
                            <MenuItem value="all">
                                <em>{t("vaccinations.allVaccines")}</em>
                            </MenuItem>
                            {drives.map((drive) => (
                                <MenuItem key={drive.id} value={drive.name}>
                                    {drive.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid size={2}>
                    <FormControl fullWidth size="small">
                        <InputLabel>{t("vaccinations.class")}</InputLabel>
                        <Select
                            value={classFilter}
                            onChange={handleClassChange}
                            label={t("vaccinations.class")}
                            disabled={loading}
                        >
                            <MenuItem value="all">
                                <em>{t("vaccinations.allClasses")}</em>
                            </MenuItem>
                            {classes.map((cls) => (
                                <MenuItem key={cls} value={cls}>
                                    {cls}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid flexGrow={1} />
                <Grid>
                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={handleClearFilters}
                        disabled={
                            loading ||
                            (!studentIdFilter &&
                                !studentNameFilter &&
                                vaccineNameFilter === "all" &&
                                classFilter === "all")
                        }
                    >
                        {t("vaccinations.clearFilters")}
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );
};

export default VaccinationFilters;
