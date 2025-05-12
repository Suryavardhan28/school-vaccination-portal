import { Upload as UploadIcon } from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    TextField,
    Typography,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { primaryButtonHoverSyles } from "../../../common/styles/primaryButtonHover";
import ModalErrorAlert from "../../../components/ModalErrorAlert";

// Import ImportResponse type from Students page or define it here
export interface ImportResponse {
    message: string;
    totalProcessed: number;
    successCount: number;
    errorCount: number;
    errors?: string[];
}

interface StudentDialogsProps {
    openAddDialog: boolean;
    openEditDialog: boolean;
    openDeleteDialog: boolean;
    openImportDialog: boolean;
    formData: {
        name: string;
        studentId: string;
        class: string;
    };
    // selectedStudentId: number | null; // Removed, not used
    csvFile: File | null;
    importResult: ImportResponse | null;
    modalError: string | null;
    loading: boolean;
    onCloseDialogs: () => void;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSelectChange: (e: SelectChangeEvent<string>) => void;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onAddStudent: (e: React.FormEvent<HTMLFormElement>) => void;
    onEditStudent: (e: React.FormEvent<HTMLFormElement>) => void;
    onDeleteStudent: () => void;
    onImportCSV: () => void;
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

const StudentDialogs: React.FC<StudentDialogsProps> = ({
    openAddDialog,
    openEditDialog,
    openDeleteDialog,
    openImportDialog,
    formData,
    csvFile,
    importResult,
    modalError,
    loading,
    onCloseDialogs,
    onInputChange,
    onSelectChange,
    onFileChange,
    onAddStudent,
    onEditStudent,
    onDeleteStudent,
    onImportCSV,
}) => {
    const { t } = useTranslation();

    // Download CSV template with headers and example row
    const handleDownloadTemplate = () => {
        const headers = ["name", "studentId", "class"];
        const example = ["John Doe", "S1001", "10"];
        const csvContent = [headers, example]
            .map((row) => row.map((field) => `"${field}"`).join(","))
            .join("\r\n");
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "students_import_template.csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <>
            {/* Add Student Dialog */}
            <Dialog open={openAddDialog} onClose={onCloseDialogs}>
                <form onSubmit={onAddStudent}>
                    <DialogTitle>{t("students.addStudent")}</DialogTitle>
                    <DialogContent>
                        <ModalErrorAlert error={modalError} />
                        <DialogContentText sx={{ mb: 2 }}>
                            {t("students.pleaseFillInStudentDetails")}
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            name="name"
                            label={t("students.fullName")}
                            type="text"
                            fullWidth
                            variant="outlined"
                            required
                            value={formData.name}
                            onChange={onInputChange}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            margin="dense"
                            name="studentId"
                            label={t("students.studentId")}
                            type="text"
                            fullWidth
                            variant="outlined"
                            required
                            value={formData.studentId}
                            onChange={onInputChange}
                            sx={{ mb: 2 }}
                        />
                        <FormControl fullWidth margin="dense">
                            <InputLabel id="class-select-label">
                                {t("students.class")}
                            </InputLabel>
                            <Select
                                labelId="class-select-label"
                                name="class"
                                value={formData.class}
                                label={t("students.class")}
                                onChange={onSelectChange}
                                required
                            >
                                {CLASS_OPTIONS.map((cls) => (
                                    <MenuItem key={cls} value={cls}>
                                        {t("students.class")} {cls}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={onCloseDialogs}>
                            {t("students.cancel")}
                        </Button>
                        <LoadingButton
                            type="submit"
                            variant="contained"
                            sx={primaryButtonHoverSyles}
                            loading={loading}
                        >
                            {t("students.addStudent")}
                        </LoadingButton>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Edit Student Dialog */}
            <Dialog open={openEditDialog} onClose={onCloseDialogs}>
                <form onSubmit={onEditStudent}>
                    <DialogTitle>{t("students.editStudent")}</DialogTitle>
                    <DialogContent>
                        <ModalErrorAlert error={modalError} />
                        <DialogContentText sx={{ mb: 2 }}>
                            {t("students.updateStudentDetails")}
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            name="name"
                            label={t("students.fullName")}
                            type="text"
                            fullWidth
                            variant="outlined"
                            required
                            value={formData.name}
                            onChange={onInputChange}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            margin="dense"
                            name="studentId"
                            label={t("students.studentId")}
                            type="text"
                            fullWidth
                            variant="outlined"
                            required
                            value={formData.studentId}
                            onChange={onInputChange}
                            sx={{ mb: 2 }}
                        />
                        <FormControl fullWidth margin="dense">
                            <InputLabel id="edit-class-select-label">
                                {t("students.class")}
                            </InputLabel>
                            <Select
                                labelId="edit-class-select-label"
                                name="class"
                                value={formData.class}
                                label={t("students.class")}
                                onChange={onSelectChange}
                                required
                            >
                                {CLASS_OPTIONS.map((cls) => (
                                    <MenuItem key={cls} value={cls}>
                                        {t("students.class")} {cls}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={onCloseDialogs}>
                            {t("students.cancel")}
                        </Button>
                        <LoadingButton
                            type="submit"
                            variant="contained"
                            color="primary"
                            sx={primaryButtonHoverSyles}
                            loading={loading}
                        >
                            {t("students.saveChanges")}
                        </LoadingButton>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={openDeleteDialog} onClose={onCloseDialogs}>
                <DialogTitle>{t("students.confirmDeletion")}</DialogTitle>
                <DialogContent>
                    <ModalErrorAlert error={modalError} />
                    <DialogContentText>
                        {t("students.confirmDeletionMessage")}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onCloseDialogs}>
                        {t("students.cancel")}
                    </Button>
                    <LoadingButton
                        onClick={onDeleteStudent}
                        color="error"
                        variant="contained"
                        sx={primaryButtonHoverSyles}
                        loading={loading}
                    >
                        {t("students.delete")}
                    </LoadingButton>
                </DialogActions>
            </Dialog>

            {/* Import CSV Dialog */}
            <Dialog open={openImportDialog} onClose={onCloseDialogs}>
                <DialogTitle>{t("students.importStudentsFromCSV")}</DialogTitle>
                <DialogContent>
                    <ModalErrorAlert error={modalError} />
                    <DialogContentText sx={{ mb: 2 }}>
                        {t("students.uploadCSVFile")}
                    </DialogContentText>

                    {/* Download CSV Template Button */}
                    <Button
                        variant="outlined"
                        onClick={handleDownloadTemplate}
                        sx={{ mb: 2, mr: 1 }}
                    >
                        {t("students.downloadCSVTemplate")}
                    </Button>

                    <input
                        accept=".csv"
                        style={{ display: "none" }}
                        id="csv-file-input"
                        type="file"
                        onChange={onFileChange}
                    />
                    <label htmlFor="csv-file-input">
                        <Button
                            variant="outlined"
                            component="span"
                            startIcon={<UploadIcon />}
                            sx={{ mb: 2 }}
                        >
                            {t("students.selectCSVFile")}
                        </Button>
                    </label>

                    {csvFile && (
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2">
                                {t("students.selectedFile")}: {csvFile.name}
                            </Typography>
                        </Box>
                    )}

                    {importResult && (
                        <Box sx={{ mt: 2 }}>
                            <Alert
                                severity={
                                    importResult.errorCount > 0
                                        ? "warning"
                                        : "success"
                                }
                                sx={{ mb: 1 }}
                            >
                                {t("students.importCompleted")}:{" "}
                                {importResult.successCount}{" "}
                                {t("students.succeeded")},{" "}
                                {importResult.errorCount} {t("students.failed")}
                            </Alert>

                            {importResult.errors &&
                                importResult.errors.length > 0 && (
                                    <Box
                                        sx={{
                                            mt: 1,
                                            maxHeight: "200px",
                                            overflow: "auto",
                                            p: 1,
                                            bgcolor: "background.paper",
                                            borderRadius: 1,
                                            border: "1px solid",
                                            borderColor: "divider",
                                        }}
                                    >
                                        <Typography
                                            variant="subtitle2"
                                            color="error"
                                            gutterBottom
                                        >
                                            {t("students.errors")}:
                                        </Typography>
                                        {importResult.errors.map(
                                            (error: string, index: number) => (
                                                <Typography
                                                    key={index}
                                                    variant="body2"
                                                    sx={{
                                                        mb: 0.5,
                                                        color: "error.main",
                                                    }}
                                                >
                                                    • {error}
                                                </Typography>
                                            )
                                        )}
                                    </Box>
                                )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={onCloseDialogs}>
                        {t("students.close")}
                    </Button>
                    <LoadingButton
                        onClick={onImportCSV}
                        variant="contained"
                        disabled={!csvFile}
                        loading={loading}
                        sx={primaryButtonHoverSyles}
                    >
                        {t("students.import")}
                    </LoadingButton>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default StudentDialogs;
