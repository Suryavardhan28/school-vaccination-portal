import LoadingButton from "@mui/lab/LoadingButton";
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    FormHelperText,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    TextField,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { ChangeEvent, FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { primaryButtonHoverSyles } from "../../../common/styles/primaryButtonHover";
import ModalErrorAlert from "../../../components/ModalErrorAlert";

interface VaccinationDriveDialogsProps {
    openAddDialog: boolean;
    openEditDialog: boolean;
    openDeleteDialog: boolean;
    formData: {
        name: string;
        date: Date;
        availableDoses: number;
        applicableClasses: string;
    };
    formErrors: {
        name: string;
        date: string;
        availableDoses: string;
        applicableClasses: string;
    };
    modalError: string | null;
    loading: boolean;
    minDriveDate: Date;
    classOptions: string[];
    onCloseDialogs: () => void;
    onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onSelectChange: (e: SelectChangeEvent<string[]>) => void;
    onDateChange: (date: Date | null) => void;
    onAddDrive: (e: FormEvent<HTMLFormElement>) => void;
    onEditDrive: (e: FormEvent<HTMLFormElement>) => void;
    onDeleteDrive: () => void;
}

const VaccinationDriveDialogs: React.FC<VaccinationDriveDialogsProps> = ({
    openAddDialog,
    openEditDialog,
    openDeleteDialog,
    formData,
    formErrors,
    modalError,
    loading,
    minDriveDate,
    classOptions,
    onCloseDialogs,
    onInputChange,
    onSelectChange,
    onDateChange,
    onAddDrive,
    onEditDrive,
    onDeleteDrive,
}) => {
    const { t } = useTranslation();

    return (
        <>
            {/* Add Drive Dialog */}
            <Dialog
                open={openAddDialog}
                onClose={onCloseDialogs}
                maxWidth="md"
                fullWidth
            >
                <form onSubmit={onAddDrive}>
                    <DialogTitle>
                        {t("vaccinationDrives.scheduleNewDrive")}
                    </DialogTitle>
                    <DialogContent>
                        <ModalErrorAlert error={modalError} />
                        <DialogContentText sx={{ mb: 2 }}>
                            {t("vaccinationDrives.scheduleNewDriveDescription")}
                        </DialogContentText>

                        <Grid container spacing={2}>
                            <Grid size={4}>
                                <TextField
                                    autoFocus
                                    margin="dense"
                                    name="name"
                                    label="Vaccine Name"
                                    type="text"
                                    fullWidth
                                    variant="outlined"
                                    required
                                    value={formData.name}
                                    onChange={onInputChange}
                                    error={!!formErrors.name}
                                    helperText={formErrors.name}
                                />
                            </Grid>

                            <Grid size={4}>
                                <LocalizationProvider
                                    dateAdapter={AdapterDateFns}
                                >
                                    <DatePicker
                                        label="Drive Date"
                                        value={formData.date}
                                        onChange={onDateChange}
                                        disablePast
                                        minDate={minDriveDate}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                margin: "dense",
                                                error: !!formErrors.date,
                                                helperText: formErrors.date,
                                            },
                                        }}
                                    />
                                </LocalizationProvider>
                            </Grid>

                            <Grid size={4}>
                                <TextField
                                    margin="dense"
                                    name="availableDoses"
                                    label="Available Doses"
                                    type="number"
                                    fullWidth
                                    variant="outlined"
                                    required
                                    value={formData.availableDoses}
                                    onChange={onInputChange}
                                    InputProps={{ inputProps: { min: 1 } }}
                                    error={!!formErrors.availableDoses}
                                    helperText={formErrors.availableDoses}
                                />
                            </Grid>

                            <Grid size={12}>
                                <FormControl
                                    fullWidth
                                    error={!!formErrors.applicableClasses}
                                >
                                    <InputLabel id="applicable-classes-label">
                                        {t(
                                            "vaccinationDrives.applicableClasses"
                                        )}
                                    </InputLabel>
                                    <Select
                                        labelId="applicable-classes-label"
                                        multiple
                                        name="applicableClasses"
                                        value={
                                            formData.applicableClasses
                                                ? formData.applicableClasses.split(
                                                      ","
                                                  )
                                                : []
                                        }
                                        onChange={onSelectChange}
                                        renderValue={(selected) => (
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    flexWrap: "wrap",
                                                    gap: 0.5,
                                                }}
                                            >
                                                {(selected as string[]).map(
                                                    (value) => (
                                                        <Chip
                                                            key={value}
                                                            label={`Class ${value}`}
                                                            size="small"
                                                        />
                                                    )
                                                )}
                                            </Box>
                                        )}
                                    >
                                        {classOptions.map((cls) => (
                                            <MenuItem key={cls} value={cls}>
                                                {t("vaccinationDrives.class")}{" "}
                                                {cls}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {formErrors.applicableClasses && (
                                        <FormHelperText>
                                            {formErrors.applicableClasses}
                                        </FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={onCloseDialogs}>
                            {t("vaccinationDrives.cancel")}
                        </Button>
                        <LoadingButton
                            type="submit"
                            variant="contained"
                            sx={primaryButtonHoverSyles}
                            loading={loading}
                        >
                            {t("vaccinationDrives.scheduleDrive")}
                        </LoadingButton>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Edit Drive Dialog */}
            <Dialog
                open={openEditDialog}
                onClose={onCloseDialogs}
                maxWidth="md"
                fullWidth
            >
                <form onSubmit={onEditDrive}>
                    <DialogTitle>
                        {t("vaccinationDrives.editVaccinationDrive")}
                    </DialogTitle>
                    <DialogContent>
                        <ModalErrorAlert error={modalError} />
                        <DialogContentText sx={{ mb: 2 }}>
                            {t(
                                "vaccinationDrives.editVaccinationDriveDescription"
                            )}
                        </DialogContentText>

                        <Grid container spacing={2}>
                            <Grid size={4}>
                                <TextField
                                    autoFocus
                                    margin="dense"
                                    name="name"
                                    label={t("vaccinationDrives.driveName")}
                                    type="text"
                                    fullWidth
                                    variant="outlined"
                                    required
                                    value={formData.name}
                                    onChange={onInputChange}
                                    error={!!formErrors.name}
                                    helperText={formErrors.name}
                                />
                            </Grid>

                            <Grid size={4}>
                                <LocalizationProvider
                                    dateAdapter={AdapterDateFns}
                                >
                                    <DatePicker
                                        label={t("vaccinationDrives.driveDate")}
                                        value={formData.date}
                                        onChange={onDateChange}
                                        disablePast
                                        minDate={minDriveDate}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                margin: "dense",
                                                error: !!formErrors.date,
                                                helperText: formErrors.date,
                                            },
                                        }}
                                    />
                                </LocalizationProvider>
                            </Grid>

                            <Grid size={4}>
                                <TextField
                                    margin="dense"
                                    name="availableDoses"
                                    label="Available Doses"
                                    type="number"
                                    fullWidth
                                    variant="outlined"
                                    required
                                    value={formData.availableDoses}
                                    onChange={onInputChange}
                                    slotProps={{
                                        input: {
                                            inputProps: { min: 1 },
                                        },
                                    }}
                                    error={!!formErrors.availableDoses}
                                    helperText={formErrors.availableDoses}
                                />
                            </Grid>

                            <Grid size={12}>
                                <FormControl
                                    fullWidth
                                    error={!!formErrors.applicableClasses}
                                >
                                    <InputLabel id="edit-applicable-classes-label">
                                        {t(
                                            "vaccinationDrives.applicableClasses"
                                        )}
                                    </InputLabel>
                                    <Select
                                        labelId="edit-applicable-classes-label"
                                        multiple
                                        name="applicableClasses"
                                        value={
                                            formData.applicableClasses
                                                ? formData.applicableClasses.split(
                                                      ","
                                                  )
                                                : []
                                        }
                                        onChange={onSelectChange}
                                        renderValue={(selected) => (
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    flexWrap: "wrap",
                                                    gap: 0.5,
                                                }}
                                            >
                                                {(selected as string[]).map(
                                                    (value) => (
                                                        <Chip
                                                            key={value}
                                                            label={`Class ${value}`}
                                                            size="small"
                                                        />
                                                    )
                                                )}
                                            </Box>
                                        )}
                                    >
                                        {classOptions.map((cls) => (
                                            <MenuItem key={cls} value={cls}>
                                                {t("vaccinationDrives.class")}{" "}
                                                {cls}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {formErrors.applicableClasses && (
                                        <FormHelperText>
                                            {formErrors.applicableClasses}
                                        </FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={onCloseDialogs}>
                            {t("vaccinationDrives.cancel")}
                        </Button>
                        <LoadingButton
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={loading}
                            sx={primaryButtonHoverSyles}
                            loading={loading}
                        >
                            {t("vaccinationDrives.saveChanges")}
                        </LoadingButton>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={openDeleteDialog} onClose={onCloseDialogs}>
                <DialogTitle>
                    {t("vaccinationDrives.confirmDeletion")}
                </DialogTitle>
                <DialogContent>
                    <ModalErrorAlert error={modalError} />
                    <DialogContentText>
                        {t("vaccinationDrives.confirmDeletionMessage")}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onCloseDialogs}>
                        {t("vaccinationDrives.cancel")}
                    </Button>
                    <LoadingButton
                        onClick={onDeleteDrive}
                        color="error"
                        variant="contained"
                        disabled={loading}
                        sx={primaryButtonHoverSyles}
                    >
                        {t("vaccinationDrives.delete")}
                    </LoadingButton>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default VaccinationDriveDialogs;
