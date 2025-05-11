import LoadingButton from "@mui/lab/LoadingButton";
import {
    Autocomplete,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    Step,
    StepLabel,
    Stepper,
    TextField,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { primaryButtonHoverSyles } from "../../../common/styles/primaryButtonHover";
import ModalErrorAlert from "../../../components/ModalErrorAlert";
import { Student } from "../../../services/studentService";
import { VaccinationDrive } from "../../../services/vaccinationDriveService";

interface VaccinationDialogsProps {
    openAddDialog: boolean;
    openDeleteDialog: boolean;
    openEditDialog: boolean;
    formData: {
        studentId: number;
        driveId: number;
        vaccinationDate: Date;
    };
    currentStep: number;
    filteredStudents: Student[];
    drives: VaccinationDrive[];
    modalError: string | null;
    loading: boolean;
    onCloseDialogs: () => void;
    onSelectChange: (
        e: SelectChangeEvent | React.ChangeEvent<HTMLInputElement>
    ) => void;
    onDateChange: (date: Date | null) => void;
    onAddVaccination: (e: FormEvent<HTMLFormElement>) => void;
    onDeleteVaccination: () => void;
    onNextStep: () => void;
    onPrevStep: () => void;
}

const VaccinationDialogs: React.FC<VaccinationDialogsProps> = ({
    openAddDialog,
    openDeleteDialog,
    openEditDialog,
    formData,
    currentStep,
    filteredStudents,
    drives,
    modalError,
    loading,
    onCloseDialogs,
    onSelectChange,
    onDateChange,
    onAddVaccination,
    onDeleteVaccination,
    onNextStep,
    onPrevStep,
}) => {
    const { t } = useTranslation();

    // Filter drives that have started (today or past)
    const availableDrives = drives.filter((drive) => {
        const driveDate = new Date(drive.date);
        return driveDate <= new Date();
    });
    // Add validation for vaccination date
    const isVaccinationDateValid = () => {
        if (!formData.vaccinationDate) return false;

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day

        const selectedDrive = drives.find((d) => d.id === formData.driveId);
        if (!selectedDrive) return false;

        const driveDate = new Date(selectedDrive.date);
        driveDate.setHours(0, 0, 0, 0); // Reset time to start of day

        const vaccinationDate = new Date(formData.vaccinationDate);
        vaccinationDate.setHours(0, 0, 0, 0); // Reset time to start of day

        return vaccinationDate >= driveDate && vaccinationDate <= today;
    };

    return (
        <>
            {/* Add/Edit Vaccination Dialog */}
            <Dialog
                open={openAddDialog || openEditDialog}
                onClose={onCloseDialogs}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {openEditDialog
                        ? t("vaccinations.editVaccination")
                        : t("vaccinations.addVaccination")}
                </DialogTitle>
                <DialogContent>
                    <ModalErrorAlert error={modalError} />
                    <DialogContentText sx={{ mb: 2 }}>
                        {openEditDialog
                            ? t("vaccinations.editVaccinationDescription")
                            : t("vaccinations.addVaccinationDescription")}
                    </DialogContentText>

                    <Stepper activeStep={currentStep - 1} sx={{ mb: 3 }}>
                        <Step>
                            <StepLabel>
                                {t("vaccinations.selectDrive")}
                            </StepLabel>
                        </Step>
                        <Step>
                            <StepLabel>
                                {t("vaccinations.selectStudent")}
                            </StepLabel>
                        </Step>
                        <Step>
                            <StepLabel>
                                {t("vaccinations.confirmDetails")}
                            </StepLabel>
                        </Step>
                    </Stepper>

                    {currentStep === 1 && (
                        <Grid container spacing={2}>
                            <Grid size={6}>
                                <FormControl fullWidth>
                                    <InputLabel>
                                        {t("vaccinations.selectDrive")}
                                    </InputLabel>
                                    <Select
                                        name="driveId"
                                        value={formData.driveId.toString()}
                                        label={t("vaccinations.selectDrive")}
                                        onChange={(e) => {
                                            const value = parseInt(
                                                e.target.value as string,
                                                10
                                            );
                                            const event = {
                                                target: {
                                                    name: "driveId",
                                                    value,
                                                },
                                            } as unknown as SelectChangeEvent;
                                            onSelectChange(event);
                                        }}
                                        required
                                    >
                                        <MenuItem value="0">
                                            {t("vaccinations.selectDrive")}
                                        </MenuItem>
                                        {availableDrives.map((drive) => (
                                            <MenuItem
                                                key={drive.id}
                                                value={drive.id.toString()}
                                            >
                                                {drive.name} (
                                                {drive.availableDoses}{" "}
                                                {t(
                                                    "vaccinations.availableDoses"
                                                )}
                                                )
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    )}

                    {currentStep === 2 && (
                        <Grid container spacing={2}>
                            <Grid size={6}>
                                <Autocomplete
                                    options={filteredStudents}
                                    getOptionLabel={(option) =>
                                        `${option.name} (${option.studentId} - Class ${option.class})`
                                    }
                                    value={
                                        filteredStudents.find(
                                            (s) => s.id === formData.studentId
                                        ) || null
                                    }
                                    onChange={(_, newValue) => {
                                        const event = {
                                            target: {
                                                name: "studentId",
                                                value: newValue?.id || 0,
                                            },
                                        } as unknown as SelectChangeEvent;
                                        onSelectChange(event);
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label={t(
                                                "vaccinations.selectStudent"
                                            )}
                                            required
                                        />
                                    )}
                                    disabled={loading}
                                    isOptionEqualToValue={(option, value) =>
                                        option.id === value.id
                                    }
                                    loading={loading}
                                    loadingText={t(
                                        "vaccinations.loadingStudents"
                                    )}
                                    noOptionsText={t(
                                        "vaccinations.noStudentsFound"
                                    )}
                                />
                            </Grid>
                        </Grid>
                    )}

                    {currentStep === 3 && (
                        <Grid container spacing={2}>
                            <Grid size={4}>
                                <LocalizationProvider
                                    dateAdapter={AdapterDateFns}
                                >
                                    <DatePicker
                                        label={t(
                                            "vaccinations.vaccinationDate"
                                        )}
                                        value={formData.vaccinationDate}
                                        onChange={onDateChange}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                required: true,
                                            },
                                        }}
                                        minDate={(() => {
                                            const selectedDrive = drives.find(
                                                (d) => d.id === formData.driveId
                                            );
                                            return selectedDrive?.date
                                                ? new Date(selectedDrive.date)
                                                : new Date();
                                        })()}
                                        disableFuture
                                    />
                                </LocalizationProvider>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={onCloseDialogs}>
                        {t("vaccinations.cancel")}
                    </Button>
                    {currentStep > 1 && (
                        <Button onClick={onPrevStep}>
                            {t("vaccinations.previous")}
                        </Button>
                    )}
                    {currentStep < 3 ? (
                        <Button
                            type="button"
                            onClick={onNextStep}
                            variant="contained"
                            disabled={
                                (currentStep === 1 && formData.driveId === 0) ||
                                (currentStep === 2 && formData.studentId === 0)
                            }
                            sx={primaryButtonHoverSyles}
                        >
                            {t("vaccinations.next")}
                        </Button>
                    ) : (
                        <LoadingButton
                            type="button"
                            variant="contained"
                            disabled={!isVaccinationDateValid()}
                            onClick={() => {
                                if (isVaccinationDateValid()) {
                                    onAddVaccination({
                                        preventDefault: () => {},
                                    } as FormEvent<HTMLFormElement>);
                                }
                            }}
                            sx={primaryButtonHoverSyles}
                            loading={loading}
                        >
                            {openEditDialog
                                ? t("vaccinations.save")
                                : t("vaccinations.add")}
                        </LoadingButton>
                    )}
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={openDeleteDialog} onClose={onCloseDialogs}>
                <DialogTitle>{t("vaccinations.confirmDeletion")}</DialogTitle>
                <DialogContent>
                    <ModalErrorAlert error={modalError} />
                    <DialogContentText>
                        {t("vaccinations.confirmDeletionMessage")}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onCloseDialogs}>
                        {t("vaccinations.cancel")}
                    </Button>
                    <Button
                        onClick={onDeleteVaccination}
                        color="error"
                        variant="contained"
                        disabled={loading}
                    >
                        {loading
                            ? t("vaccinations.deleting")
                            : t("vaccinations.delete")}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default VaccinationDialogs;
