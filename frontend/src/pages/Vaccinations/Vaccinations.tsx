import {
    Add as AddIcon,
    Clear as ClearIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    FilterList as FilterListIcon,
} from "@mui/icons-material";
import {
    Box,
    Button,
    Chip,
    IconButton,
    Paper,
    SelectChangeEvent,
    Typography,
} from "@mui/material";
import { format } from "date-fns";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { primaryButtonHoverSyles } from "../../common/styles/primaryButtonHover";
import SortableTable, {
    Column,
    SortDirection,
} from "../../components/SortableTable";
import TableSkeleton from "../../components/TableSkeleton";
import { useNotification } from "../../contexts/NotificationContext";
import { Student, getStudents } from "../../services/studentService";
import {
    VaccinationDrive,
    getVaccinationDrivesDropdown,
} from "../../services/vaccinationDriveService";
import {
    Vaccination,
    createVaccination,
    deleteVaccination,
    getClassList,
    getVaccinations,
    updateVaccination,
} from "../../services/vaccinationService";
import VaccinationDialogs from "./components/VaccinationDialogs";
import VaccinationFilters from "./components/VaccinationFilters";

interface VaccinationWithDetails extends Omit<Vaccination, "studentId"> {
    studentId: string;
    studentName: string;
    class: string;
    vaccineName: string;
    date: string;
}

const Vaccinations = () => {
    const { t } = useTranslation();
    const { showNotification } = useNotification();

    // State for vaccinations
    const [vaccinations, setVaccinations] = useState<VaccinationWithDetails[]>(
        []
    );
    const [totalVaccinations, setTotalVaccinations] = useState(0);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [loading, setLoading] = useState(true);
    const [dialogLoading, setDialogLoading] = useState(false);

    // State for dropdown data
    const [drives, setDrives] = useState<VaccinationDrive[]>([]);
    const [classes, setClasses] = useState<string[]>([]);

    // State for filters
    const [studentIdFilter, setStudentIdFilter] = useState("");
    const [studentNameFilter, setStudentNameFilter] = useState("");
    const [vaccineNameFilter, setVaccineNameFilter] = useState("");
    const [classFilter, setClassFilter] = useState("");
    const [sortField, setSortField] = useState<string>("date");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

    // State for dialogs
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedVaccination, setSelectedVaccination] =
        useState<VaccinationWithDetails | null>(null);
    const [modalError, setModalError] = useState<string | null>(null);

    // State for form
    const [formData, setFormData] = useState({
        studentId: 0,
        driveId: 0,
        vaccinationDate: new Date(),
    });
    const [currentStep, setCurrentStep] = useState(1);
    const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);

    // Add showFilters state
    const [showFilters, setShowFilters] = useState(false);

    // Add edit dialog state
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [editingVaccination, setEditingVaccination] =
        useState<VaccinationWithDetails | null>(null);

    // Load vaccinations
    const loadVaccinations = useMemo(
        () => async () => {
            try {
                setLoading(true);
                const filters = {
                    studentId: studentIdFilter || undefined,
                    studentName: studentNameFilter || undefined,
                    vaccineName: vaccineNameFilter || undefined,
                    class: classFilter || undefined,
                    sortField,
                    sortDirection,
                };
                const response = await getVaccinations(
                    page,
                    rowsPerPage,
                    filters
                );
                // Map to VaccinationWithDetails
                const mapped = response.vaccinations.map((v) => ({
                    ...v,
                    studentId: v.Student ? v.Student.studentId : "",
                    studentName: v.Student ? v.Student.name : "",
                    class: v.Student ? v.Student.class : "",
                    vaccineName: v.VaccinationDrive
                        ? v.VaccinationDrive.name
                        : "",
                    date: v.vaccinationDate,
                }));
                setVaccinations(mapped);
                setTotalVaccinations(response.total);
            } catch {
                showNotification(t("vaccinations.loadError"), "error");
            } finally {
                setLoading(false);
            }
        },
        [
            page,
            rowsPerPage,
            studentIdFilter,
            studentNameFilter,
            vaccineNameFilter,
            classFilter,
            sortField,
            sortDirection,
            t,
            showNotification,
        ]
    );

    // Load dropdown data
    const loadDropdownData = async () => {
        try {
            setLoading(true);
            const [classList, drivesList] = await Promise.all([
                getClassList(),
                getVaccinationDrivesDropdown(),
            ]);
            setClasses(classList);
            setDrives(drivesList);
        } catch {
            showNotification(t("vaccinations.loadError"), "error");
        } finally {
            setLoading(false);
        }
    };

    // Load students when drive is selected
    useEffect(() => {
        const loadEligibleStudents = async () => {
            if (formData.driveId === 0) {
                setFilteredStudents([]);
                return;
            }

            try {
                setDialogLoading(true);
                const selectedDrive = drives.find(
                    (d) => d.id === formData.driveId
                );
                if (!selectedDrive) return;

                const response = await getStudents(1, 1000, {
                    class: selectedDrive.applicableClasses,
                });
                setFilteredStudents(response.students);
            } catch {
                showNotification(t("vaccinations.loadError"), "error");
            } finally {
                setDialogLoading(false);
            }
        };

        loadEligibleStudents();
    }, [formData.driveId, drives, t, showNotification]);

    useEffect(() => {
        loadVaccinations();
    }, [loadVaccinations]);

    useEffect(() => {
        loadDropdownData();
    }, []);

    const handlePageChange = (_: unknown, newPage: number) => {
        setPage(newPage + 1);
    };

    const handleRowsPerPageChange = (event: ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(1);
    };

    const handleFilterChange = (
        studentId: string,
        studentName: string,
        vaccineName: string,
        classValue: string
    ) => {
        setStudentIdFilter(studentId);
        setStudentNameFilter(studentName);
        setVaccineNameFilter(vaccineName);
        setClassFilter(classValue);
        setPage(1);
    };

    const handleSortChange = (field: string, direction: SortDirection) => {
        setSortField(field);
        setSortDirection(direction);
    };

    const handleAddClick = () => {
        setFormData({
            studentId: 0,
            driveId: 0,
            vaccinationDate: new Date(),
        });
        setCurrentStep(1);
        setModalError(null);
        setOpenAddDialog(true);
    };

    const handleDeleteClick = (vaccination: VaccinationWithDetails) => {
        setSelectedVaccination(vaccination);
        setModalError(null);
        setOpenDeleteDialog(true);
    };

    // Add edit handler
    const handleEditClick = async (vaccination: VaccinationWithDetails) => {
        setEditingVaccination(vaccination);

        // Find the student in the filtered list to get the correct ID
        const student = filteredStudents.find(
            (s) => s.studentId === vaccination.studentId
        );

        setFormData({
            studentId: student?.id || 0,
            driveId: vaccination.driveId,
            vaccinationDate: new Date(vaccination.date),
        });
        setCurrentStep(1);
        setModalError(null);
        setOpenEditDialog(true);

        // Load eligible students for the drive
        try {
            const selectedDrive = drives.find(
                (d) => d.id === vaccination.driveId
            );
            if (selectedDrive) {
                const response = await getStudents(1, 1000, {
                    class: selectedDrive.applicableClasses,
                });
                setFilteredStudents(response.students);

                // After loading students, find and set the correct student ID
                const updatedStudent = response.students.find(
                    (s) => s.studentId === vaccination.studentId
                );
                if (updatedStudent) {
                    setFormData((prev) => ({
                        ...prev,
                        studentId: updatedStudent.id,
                    }));
                }
            }
        } catch (error) {
            console.error("Error loading eligible students:", error);
            showNotification(t("vaccinations.loadError"), "error");
        }
    };

    // Update handleCloseDialogs
    const handleCloseDialogs = () => {
        setOpenAddDialog(false);
        setOpenDeleteDialog(false);
        setOpenEditDialog(false);
        setSelectedVaccination(null);
        setEditingVaccination(null);
        setModalError(null);
    };

    const handleSelectChange = (
        e: SelectChangeEvent | React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name as string]:
                typeof value === "string" ? parseInt(value, 10) : value,
        }));
    };

    const handleDateChange = (date: Date | null) => {
        if (date) {
            setFormData((prev) => ({
                ...prev,
                vaccinationDate: date,
            }));
        }
    };

    const handleAddVaccination = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setDialogLoading(true);
        setModalError(null);

        try {
            const vaccinationData = {
                ...formData,
                vaccinationDate: formData.vaccinationDate.toISOString(),
            };

            if (editingVaccination) {
                await updateVaccination(editingVaccination.id, vaccinationData);
            } else {
                await createVaccination(vaccinationData);
            }
            await loadVaccinations();
            handleCloseDialogs();
        } catch (error: unknown) {
            console.error("Error saving vaccination:", error);
            if (
                error &&
                typeof error === "object" &&
                "response" in error &&
                error.response &&
                typeof error.response === "object" &&
                "data" in error.response &&
                error.response.data &&
                typeof error.response.data === "object" &&
                "message" in error.response.data
            ) {
                setModalError(error.response.data.message as string);
            } else {
                setModalError(t("vaccinations.errorSavingVaccination"));
            }
        } finally {
            setDialogLoading(false);
        }
    };

    const handleDeleteVaccination = async () => {
        if (!selectedVaccination) return;
        try {
            setDialogLoading(true);
            await deleteVaccination(selectedVaccination.id);
            showNotification(t("vaccinations.deleteSuccess"), "success");
            handleCloseDialogs();
            loadVaccinations();
        } catch (err) {
            setModalError(
                err instanceof Error ? err.message : "An error occurred"
            );
        } finally {
            setDialogLoading(false);
        }
    };

    const handleNextStep = () => {
        setCurrentStep((prev) => prev + 1);
    };

    const handlePrevStep = () => {
        setCurrentStep((prev) => prev - 1);
    };

    const columns: Column<VaccinationWithDetails>[] = [
        {
            id: "studentId",
            label: t("vaccinations.studentId"),
            sortable: true,
            render: (vaccination: VaccinationWithDetails) =>
                vaccination.studentId,
        },
        {
            id: "studentName",
            label: t("vaccinations.studentName"),
            sortable: true,
            render: (vaccination: VaccinationWithDetails) =>
                vaccination.studentName,
        },
        {
            id: "class",
            label: t("vaccinations.class"),
            sortable: true,
            render: (vaccination: VaccinationWithDetails) => (
                <Chip label={vaccination.class} size="small" />
            ),
        },
        {
            id: "vaccineName",
            label: t("vaccinations.vaccineName"),
            sortable: true,
            render: (vaccination: VaccinationWithDetails) =>
                vaccination.vaccineName,
        },
        {
            id: "date",
            label: t("vaccinations.date"),
            sortable: true,
            render: (vaccination: VaccinationWithDetails) =>
                format(new Date(vaccination.date), "dd/MM/yyyy"),
        },
        {
            id: "actions",
            label: t("vaccinations.actions"),
            sortable: false,
            render: (vaccination: VaccinationWithDetails) => (
                <Box>
                    <IconButton
                        onClick={() => handleEditClick(vaccination)}
                        color="primary"
                        size="small"
                        sx={{ mr: 1 }}
                    >
                        <EditIcon />
                    </IconButton>
                    <IconButton
                        onClick={() => handleDeleteClick(vaccination)}
                        color="error"
                        size="small"
                    >
                        <DeleteIcon />
                    </IconButton>
                </Box>
            ),
        },
    ];

    return (
        <Box>
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                my={2}
            >
                <Typography variant="h4" component="h1">
                    {t("vaccinations.title")}
                </Typography>
                <Box display="flex" gap={1}>
                    <Button
                        variant="outlined"
                        startIcon={
                            showFilters ? <ClearIcon /> : <FilterListIcon />
                        }
                        onClick={() => setShowFilters((prev) => !prev)}
                    >
                        {showFilters
                            ? t("vaccinations.hideFilters")
                            : t("vaccinations.showFilters")}
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAddClick}
                        sx={primaryButtonHoverSyles}
                    >
                        {t("vaccinations.addVaccinationRecord")}
                    </Button>
                </Box>
            </Box>

            {showFilters && (
                <Paper sx={{ p: 2, mb: 3 }}>
                    <VaccinationFilters
                        studentIdFilter={studentIdFilter}
                        studentNameFilter={studentNameFilter}
                        vaccineNameFilter={vaccineNameFilter}
                        classFilter={classFilter}
                        classes={classes}
                        drives={drives}
                        loading={loading}
                        onFilterChange={handleFilterChange}
                    />
                </Paper>
            )}

            {loading ? (
                <TableSkeleton columns={columns} rowsPerPage={rowsPerPage} />
            ) : (
                <SortableTable
                    columns={columns}
                    data={vaccinations}
                    page={page - 1}
                    rowsPerPage={rowsPerPage}
                    totalCount={totalVaccinations}
                    onPageChange={handlePageChange}
                    onRowsPerPageChange={handleRowsPerPageChange}
                    onSortChange={handleSortChange}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    keyExtractor={(vaccination) => vaccination.id.toString()}
                />
            )}

            <VaccinationDialogs
                openAddDialog={openAddDialog}
                openDeleteDialog={openDeleteDialog}
                openEditDialog={openEditDialog}
                formData={formData}
                currentStep={currentStep}
                filteredStudents={filteredStudents}
                drives={drives}
                modalError={modalError}
                loading={dialogLoading}
                onCloseDialogs={handleCloseDialogs}
                onSelectChange={handleSelectChange}
                onDateChange={handleDateChange}
                onAddVaccination={handleAddVaccination}
                onDeleteVaccination={handleDeleteVaccination}
                onNextStep={handleNextStep}
                onPrevStep={handlePrevStep}
            />
        </Box>
    );
};

export default Vaccinations;
