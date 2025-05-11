import {
    Add as AddIcon,
    Clear as ClearIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    FilterList as FilterListIcon,
    Upload as UploadIcon,
} from "@mui/icons-material";
import {
    Alert,
    Box,
    Button,
    Chip,
    IconButton,
    Typography,
} from "@mui/material";
import { debounce } from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { primaryButtonHoverSyles } from "../../common/styles/primaryButtonHover";
import SortableTable, {
    Column,
    SortDirection,
} from "../../components/SortableTable";
import TableSkeleton from "../../components/TableSkeleton";
import { useAuth } from "../../contexts/AuthContext";
import { useNotification } from "../../contexts/NotificationContext";
import useModalError from "../../hooks/useModalError";
import {
    createStudent,
    deleteStudent,
    getStudents,
    importStudentsFromCSV,
    Student,
    updateStudent,
} from "../../services/studentService";
import StudentDialogs from "./components/StudentDialogs";
import StudentFilters from "./components/StudentFilters";

// Add an interface for the CSV import response
interface ImportResponse {
    message: string;
    totalProcessed: number;
    successCount: number;
    errorCount: number;
    errors?: string[];
}

const Students = () => {
    const { t } = useTranslation();
    // State for students list
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState<string | null>(null);

    // Pagination state
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    // Search filters
    const [nameFilter, setNameFilter] = useState("");
    const [studentIdFilter, setStudentIdFilter] = useState("");
    const [classFilter, setClassFilter] = useState("");

    // Dialog states
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [openImportDialog, setOpenImportDialog] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        studentId: "",
        class: "",
    });
    const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
        null
    );

    // CSV import state
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [importResult, setImportResult] = useState<ImportResponse | null>(
        null
    );

    // Add notification hook
    const { showNotification } = useNotification();

    // Add modal error handling
    const { error: modalError, setModalError, clearError } = useModalError();

    // Add sort state
    const [sortField, setSortField] = useState<string>("name");
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

    // Add showFilters state
    const [showFilters, setShowFilters] = useState(false);

    // Add toggleFilters function
    const toggleFilters = () => {
        setShowFilters((prev) => !prev);
    };

    // Create debounced fetch function
    const debouncedFetch = useMemo(
        () =>
            debounce(
                async (searchParams: {
                    name?: string;
                    studentId?: string;
                    class?: string;
                    sortField: string;
                    sortDirection: SortDirection;
                }) => {
                    try {
                        setLoading(true);
                        const response = await getStudents(
                            page + 1,
                            rowsPerPage,
                            searchParams
                        );
                        setStudents(response.students);
                        setTotalCount(response.total);
                    } catch (err) {
                        console.error("Failed to fetch students:", err);
                        setPageError(t("students.failedToLoadStudents"));
                    } finally {
                        setLoading(false);
                    }
                },
                500
            ),
        [page, rowsPerPage, t]
    );

    // Effect to trigger search when filters change
    useEffect(() => {
        debouncedFetch({
            name: nameFilter || undefined,
            studentId: studentIdFilter || undefined,
            class: classFilter || undefined,
            sortField,
            sortDirection,
        });
    }, [
        nameFilter,
        studentIdFilter,
        classFilter,
        sortField,
        sortDirection,
        debouncedFetch,
    ]);

    // Cleanup debounced function on unmount
    useEffect(() => {
        return () => {
            debouncedFetch.cancel();
        };
    }, [debouncedFetch]);

    // Handle dialog open/close
    const handleOpenAddDialog = () => {
        setFormData({ name: "", studentId: "", class: "" });
        setOpenAddDialog(true);
    };

    const handleOpenEditDialog = (student: Student) => {
        setFormData({
            name: student.name,
            studentId: student.studentId,
            class: student.class,
        });
        setSelectedStudentId(student.id);
        setOpenEditDialog(true);
    };

    const handleOpenDeleteDialog = (studentId: number) => {
        setSelectedStudentId(studentId);
        setOpenDeleteDialog(true);
    };

    const handleOpenImportDialog = () => {
        setCsvFile(null);
        setImportResult(null);
        setOpenImportDialog(true);
    };

    const handleCloseDialogs = () => {
        setOpenAddDialog(false);
        setOpenEditDialog(false);
        setOpenDeleteDialog(false);
        setOpenImportDialog(false);
        clearError();
        debouncedFetch({
            name: nameFilter || undefined,
            studentId: studentIdFilter || undefined,
            class: classFilter || undefined,
            sortField,
            sortDirection,
        });
    };

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle pagination changes
    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Handle search filter changes
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === "nameFilter") setNameFilter(value);
        else if (name === "studentIdFilter") setStudentIdFilter(value);
        else if (name === "classFilter") setClassFilter(value);
    };

    const clearFilters = () => {
        setNameFilter("");
        setStudentIdFilter("");
        setClassFilter("");
    };

    // Handle CSV file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setCsvFile(e.target.files[0]);
        }
    };

    // Handle form submissions
    const handleAddStudent = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        clearError();

        try {
            setLoading(true);
            await createStudent(formData);
            handleCloseDialogs();

            showNotification(t("students.addedSuccessfully"), "success");
        } catch (err: unknown) {
            console.error("Error adding student:", err);

            // Show generic error in snackbar
            showNotification(t("students.failedToAddStudent"), "error");

            // Show detailed error in modal
            if (
                err &&
                typeof err === "object" &&
                "response" in err &&
                err.response &&
                typeof err.response === "object" &&
                "data" in err.response &&
                err.response.data &&
                typeof err.response.data === "object" &&
                "message" in err.response.data
            ) {
                setModalError(err.response.data.message as string);
            } else {
                setModalError("Failed to add student.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEditStudent = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        clearError();

        if (!selectedStudentId) return;

        try {
            setLoading(true);
            await updateStudent(selectedStudentId, formData);
            handleCloseDialogs();
            showNotification(t("students.updatedSuccessfully"), "success");
        } catch (err: unknown) {
            console.error("Error updating student:", err);

            // Show generic error in snackbar
            showNotification(t("students.failedToUpdateStudent"), "error");

            // Show detailed error in modal
            if (
                err &&
                typeof err === "object" &&
                "response" in err &&
                err.response &&
                typeof err.response === "object" &&
                "data" in err.response &&
                err.response.data &&
                typeof err.response.data === "object" &&
                "message" in err.response.data
            ) {
                setModalError(err.response.data.message as string);
            } else {
                setModalError("Failed to update student.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteStudent = async () => {
        if (!selectedStudentId) return;

        try {
            setLoading(true);
            await deleteStudent(selectedStudentId);
            handleCloseDialogs();

            showNotification(t("students.deletedSuccessfully"), "success");
        } catch (err: unknown) {
            console.error("Error deleting student:", err);

            // Show generic error in snackbar
            showNotification(t("students.failedToDeleteStudent"), "error");

            // Show detailed error in modal
            if (
                err &&
                typeof err === "object" &&
                "response" in err &&
                err.response &&
                typeof err.response === "object" &&
                "data" in err.response &&
                err.response.data &&
                typeof err.response.data === "object" &&
                "message" in err.response.data
            ) {
                setModalError(err.response.data.message as string);
            } else {
                setModalError("Failed to delete student.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleImportCSV = async () => {
        if (!csvFile) return;

        try {
            setLoading(true);
            const response = await importStudentsFromCSV(csvFile);
            setCsvFile(null);

            // For imports, keep the detailed success information in the snackbar
            const successMessage = `Imported ${
                response.successCount
            } students successfully. ${
                response.errorCount > 0 ? `${response.errorCount} errors.` : ""
            }`;

            showNotification(successMessage, "success");
            handleCloseDialogs();

            setImportResult(response);
        } catch (err: unknown) {
            if (
                err &&
                typeof err === "object" &&
                "response" in err &&
                err.response &&
                typeof err.response === "object" &&
                "data" in err.response &&
                err.response.data &&
                typeof err.response.data === "object"
            ) {
                const responseData = err.response.data as {
                    message?: string;
                    successCount?: number;
                    errorCount?: number;
                    errors?: string[];
                    totalProcessed?: number;
                };
                console.log("responseData", responseData);

                // Set the response data to importResult to display in the dialog
                setImportResult({
                    message:
                        responseData.message ||
                        t("students.failedToImportStudents"),
                    totalProcessed: responseData.totalProcessed || 0,
                    successCount: responseData.successCount || 0,
                    errorCount: responseData.errorCount || 0,
                    errors: responseData.errors || [],
                });
            } else {
                setModalError(t("students.failedToImportStudents"));
            }
        } finally {
            setLoading(false);
        }
    };

    // Handle sort change
    const handleSortChange = (field: string, direction: SortDirection) => {
        setSortField(field);
        setSortDirection(direction);
    };

    // Add user context
    const { user } = useAuth();

    // Define columns for the SortableTable
    const columns: Column<Student>[] = [
        {
            id: "name",
            label: "Name",
            sortable: true,
            render: (row) => row.name,
        },
        {
            id: "studentId",
            label: "Student ID",
            sortable: true,
            render: (row) => row.studentId,
        },
        {
            id: "class",
            label: "Class",
            sortable: true,
            render: (row) => <Chip label={row.class} size="small" />,
        },
        {
            id: "actions",
            label: "Actions",
            sortable: false,
            render: (row) => (
                <>
                    <IconButton
                        color="primary"
                        onClick={() => handleOpenEditDialog(row)}
                    >
                        <EditIcon />
                    </IconButton>
                    {user?.role === "admin" && (
                        <IconButton
                            color="error"
                            onClick={() => handleOpenDeleteDialog(row.id)}
                        >
                            <DeleteIcon />
                        </IconButton>
                    )}
                </>
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
                    {t("students.title")}
                </Typography>
                <Box display="flex" gap={1}>
                    <Button
                        variant="outlined"
                        startIcon={
                            showFilters ? <ClearIcon /> : <FilterListIcon />
                        }
                        onClick={toggleFilters}
                    >
                        {showFilters
                            ? t("students.hideFilters")
                            : t("students.showFilters")}
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<UploadIcon />}
                        onClick={handleOpenImportDialog}
                    >
                        {t("students.importCSV")}
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenAddDialog}
                        sx={primaryButtonHoverSyles}
                    >
                        {t("students.addStudent")}
                    </Button>
                </Box>
            </Box>

            {pageError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {pageError}
                </Alert>
            )}

            {showFilters && (
                <StudentFilters
                    nameFilter={nameFilter}
                    studentIdFilter={studentIdFilter}
                    classFilter={classFilter}
                    loading={loading}
                    onFilterChange={handleFilterChange}
                    onClearFilters={clearFilters}
                />
            )}

            {loading && students.length === 0 ? (
                <TableSkeleton columns={columns} rowsPerPage={rowsPerPage} />
            ) : (
                <SortableTable
                    columns={columns}
                    data={students}
                    keyExtractor={(student) => student.id}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSortChange={handleSortChange}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    totalCount={totalCount}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    loading={loading}
                    emptyMessage={t("students.noStudentsFound")}
                />
            )}

            <StudentDialogs
                openAddDialog={openAddDialog}
                openEditDialog={openEditDialog}
                openDeleteDialog={openDeleteDialog}
                openImportDialog={openImportDialog}
                formData={formData}
                csvFile={csvFile}
                importResult={importResult}
                modalError={modalError}
                loading={loading}
                onCloseDialogs={handleCloseDialogs}
                onInputChange={handleInputChange}
                onFileChange={handleFileChange}
                onAddStudent={handleAddStudent}
                onEditStudent={handleEditStudent}
                onDeleteStudent={handleDeleteStudent}
                onImportCSV={handleImportCSV}
            />
        </Box>
    );
};

export default Students;
