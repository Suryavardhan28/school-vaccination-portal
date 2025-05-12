import {
    Add as AddIcon,
    Clear as ClearIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    FilterList as FilterListIcon,
} from "@mui/icons-material";
import {
    Alert,
    Badge,
    Box,
    Button,
    Chip,
    IconButton,
    SelectChangeEvent,
    Typography,
    useTheme,
} from "@mui/material";
import { debounce } from "lodash";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { primaryButtonHoverSyles } from "../../common/styles/primaryButtonHover";
import SortableTable, {
    Column,
    SortDirection,
} from "../../components/SortableTable";
import TableSkeleton from "../../components/TableSkeleton";
import { useNotification } from "../../contexts/NotificationContext";
import useModalError from "../../hooks/useModalError";
import {
    createVaccinationDrive,
    deleteVaccinationDrive,
    getVaccinationDriveById,
    getVaccinationDrives,
    updateVaccinationDrive,
    VaccinationDrive,
} from "../../services/vaccinationDriveService";
import VaccinationDriveDialogs from "./components/VaccinationDriveDialogs";
import VaccinationDriveFilters from "./components/VaccinationDriveFilters";

// Get today's date at midnight
const today = new Date();
today.setHours(0, 0, 0, 0);

// Get the date 15 days from now
const minDriveDate = new Date(today);
minDriveDate.setDate(today.getDate() + 15);

const VaccinationDrives = () => {
    const { t } = useTranslation();
    const theme = useTheme();

    // State for drives list
    const [drives, setDrives] = useState<VaccinationDrive[]>([]);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState<string | null>(null);

    const urlParams = useLocation().search;

    // Pagination state
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    // Filter state
    const [upcomingOnly, setUpcomingOnly] = useState(
        urlParams.includes("upcoming=true")
    );
    const [nameFilter, setNameFilter] = useState("");
    const [classFilter, setClassFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState<
        "all" | "upcoming" | "past"
    >("all");
    const [showFilters, setShowFilters] = useState(false);

    // Dialog states
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        date: new Date(minDriveDate),
        availableDoses: 0,
        applicableClasses: "",
    });
    const [formErrors, setFormErrors] = useState({
        name: "",
        date: "",
        availableDoses: "",
        applicableClasses: "",
    });
    const [selectedDriveId, setSelectedDriveId] = useState<number | null>(null);

    // Add notification hook
    const { showNotification } = useNotification();

    // Add modal error handling
    const { error: modalError, setModalError, clearError } = useModalError();

    // Add sort state
    const [sortField, setSortField] = useState<string>("date");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

    // Create debounced fetch function
    const debouncedFetch = useMemo(
        () =>
            debounce(
                async (searchParams: {
                    name?: string;
                    class?: string;
                    status?: string;
                    upcomingOnly?: boolean;
                    sortField: string;
                    sortDirection: SortDirection;
                }) => {
                    try {
                        setLoading(true);
                        const response = await getVaccinationDrives(
                            page + 1,
                            rowsPerPage,
                            {
                                name: searchParams.name,
                                class:
                                    searchParams.class === "all"
                                        ? undefined
                                        : searchParams.class,
                                status: searchParams.status,
                                upcoming: searchParams.upcomingOnly,
                                sortField: searchParams.sortField,
                                sortDirection:
                                    searchParams.sortDirection.toLowerCase() as
                                        | "asc"
                                        | "desc",
                            }
                        );
                        setDrives(response.vaccinationDrives);
                        setTotalCount(response.total);
                    } catch (err) {
                        console.error(
                            "Failed to fetch vaccination drives:",
                            err
                        );
                        setPageError(
                            t("vaccinationDrives.failedToLoadVaccinationDrives")
                        );
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
            class: classFilter || undefined,
            status: statusFilter !== "all" ? statusFilter : undefined,
            upcomingOnly,
            sortField,
            sortDirection,
        });
    }, [
        nameFilter,
        classFilter,
        statusFilter,
        upcomingOnly,
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
        setFormData({
            name: "",
            date: new Date(minDriveDate),
            availableDoses: 1,
            applicableClasses: "",
        });
        setFormErrors({
            name: "",
            date: "",
            availableDoses: "",
            applicableClasses: "",
        });
        setOpenAddDialog(true);
    };

    const handleOpenEditDialog = async (driveId: number) => {
        try {
            setLoading(true);
            const drive = await getVaccinationDriveById(driveId);

            setFormData({
                name: drive.name,
                date: new Date(drive.date),
                availableDoses: drive.availableDoses,
                applicableClasses: drive.applicableClasses,
            });
            setFormErrors({
                name: "",
                date: "",
                availableDoses: "",
                applicableClasses: "",
            });
            setSelectedDriveId(driveId);
            setOpenEditDialog(true);
        } catch (err) {
            console.error("Error fetching drive details:", err);
            setPageError(t("vaccinationDrives.failedToLoadDriveDetails"));
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDeleteDialog = (driveId: number) => {
        setSelectedDriveId(driveId);
        setOpenDeleteDialog(true);
    };

    const handleCloseDialogs = () => {
        setOpenAddDialog(false);
        setOpenEditDialog(false);
        setOpenDeleteDialog(false);
        clearError();
    };

    // Handle form input changes
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (formErrors[name as keyof typeof formErrors]) {
            setFormErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleSelectChange = (e: SelectChangeEvent<string[]>) => {
        const name = e.target.name as string;
        const value = e.target.value as string[];
        setFormData((prev) => ({
            ...prev,
            [name]: Array.isArray(value) ? value.join(",") : value,
        }));
        // Clear error
        if (formErrors[name as keyof typeof formErrors]) {
            setFormErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleDateChange = (date: Date | null) => {
        if (date) {
            setFormData((prev) => ({ ...prev, date }));
            // Clear date error
            if (formErrors.date) {
                setFormErrors((prev) => ({ ...prev, date: "" }));
            }
        }
    };

    // Handle pagination changes
    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Toggle upcoming filter
    const toggleUpcomingFilter = () => {
        setUpcomingOnly(!upcomingOnly);
        setPage(0); // Reset to first page when filter changes

        // Show a notification to explain the filter
        if (!upcomingOnly) {
            showNotification(
                t("vaccinationDrives.showingDrivesWithinNext30DaysOnly"),
                "info"
            );
        }
    };

    // Toggle filter visibility
    const toggleFilters = () => {
        setShowFilters((prev) => !prev);
    };

    // Add clear filters function
    const clearFilters = () => {
        setNameFilter("");
        setClassFilter("all");
        setStatusFilter("all");
        setUpcomingOnly(false);
    };

    // Handle filter input changes
    const handleFilterChange = (e: SelectChangeEvent<string>) => {
        const { name, value } = e.target;

        if (name === "nameFilter") setNameFilter(value);
    };

    // Handle class filter changes
    const handleClassFilterChange = (e: SelectChangeEvent<string>) => {
        const { name, value } = e.target;
        if (name === "classFilter") setClassFilter(value);
    };

    // Handle status filter changes
    const handleStatusFilterChange = (e: SelectChangeEvent<string>) => {
        const value = e.target.value as "all" | "upcoming" | "past";
        setStatusFilter(value);

        // If status is 'upcoming' and upcomingOnly is true,
        // don't change upcomingOnly. Otherwise, set it based on the selection.
        if (value === "upcoming" && !upcomingOnly) {
            setUpcomingOnly(true);
        } else if (value !== "upcoming" && upcomingOnly) {
            setUpcomingOnly(false);
        }
    };

    // Validate form
    const validateForm = () => {
        const errors = {
            name: "",
            date: "",
            availableDoses: "",
            applicableClasses: "",
        };
        let isValid = true;

        if (!formData.name.trim()) {
            errors.name = "Vaccine name is required";
            isValid = false;
        }

        if (!formData.date) {
            errors.date = "Date is required";
            isValid = false;
        } else if (formData.date < minDriveDate) {
            errors.date = "Drive must be scheduled at least 15 days in advance";
            isValid = false;
        }

        if (formData.availableDoses <= 0) {
            errors.availableDoses = "Available doses must be greater than 0";
            isValid = false;
        }

        if (!formData.applicableClasses.trim()) {
            errors.applicableClasses = "At least one class must be selected";
            isValid = false;
        }

        setFormErrors(errors);
        return isValid;
    };

    // Handle form submission for adding a new vaccination drive
    const handleAddDrive = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        clearError();

        if (!validateForm()) return;

        try {
            setLoading(true);
            await createVaccinationDrive({
                ...formData,
                date: formData.date.toISOString(),
            });
            handleCloseDialogs();
            debouncedFetch({
                name: nameFilter || undefined,
                class: classFilter || undefined,
                status: statusFilter !== "all" ? statusFilter : undefined,
                upcomingOnly,
                sortField,
                sortDirection,
            });
            showNotification(
                t("vaccinationDrives.vaccinationDriveCreatedSuccessfully"),
                "success"
            );
        } catch (err: unknown) {
            console.error("Error creating vaccination drive:", err);

            // Show generic error in snackbar
            showNotification(
                t("vaccinationDrives.failedToCreateVaccinationDrive"),
                "error"
            );

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
                setModalError("Failed to create vaccination drive.");
            }
        } finally {
            setLoading(false);
        }
    };

    // Handle form submission for editing a vaccination drive
    const handleEditDrive = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        clearError();

        if (!validateForm() || !selectedDriveId) return;

        try {
            setLoading(true);
            await updateVaccinationDrive(selectedDriveId, {
                ...formData,
                date: formData.date.toISOString(),
            });
            handleCloseDialogs();
            debouncedFetch({
                name: nameFilter || undefined,
                class: classFilter || undefined,
                status: statusFilter !== "all" ? statusFilter : undefined,
                upcomingOnly,
                sortField,
                sortDirection,
            });
            showNotification(
                t("vaccinationDrives.vaccinationDriveUpdatedSuccessfully"),
                "success"
            );
        } catch (err: unknown) {
            console.error("Error updating vaccination drive:", err);

            // Show generic error in snackbar
            showNotification(
                t("vaccinationDrives.failedToUpdateVaccinationDrive"),
                "error"
            );

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
                setModalError("Failed to update vaccination drive.");
            }
        } finally {
            setLoading(false);
        }
    };

    // Handle deletion of a vaccination drive
    const handleDeleteDrive = async () => {
        if (!selectedDriveId) return;

        try {
            setLoading(true);
            await deleteVaccinationDrive(selectedDriveId);
            handleCloseDialogs();
            debouncedFetch({
                name: nameFilter || undefined,
                class: classFilter || undefined,
                status: statusFilter !== "all" ? statusFilter : undefined,
                upcomingOnly,
                sortField,
                sortDirection,
            });
            showNotification(
                t("vaccinationDrives.vaccinationDriveDeletedSuccessfully"),
                "success"
            );
        } catch (err: unknown) {
            console.error("Error deleting vaccination drive:", err);

            // Show generic error in snackbar
            showNotification(
                t("vaccinationDrives.failedToDeleteVaccinationDrive"),
                "error"
            );

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
                setModalError("Failed to delete vaccination drive.");
            }
        } finally {
            setLoading(false);
        }
    };

    // Helper function to determine if a drive is in the past
    const isDrivePast = (driveDate: string) => {
        const date = new Date(driveDate);
        return date < today;
    };

    // Generate class options
    const classOptions = [
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

    // Define columns for SortableTable
    const columns: Column<VaccinationDrive>[] = [
        {
            id: "name",
            label: t("vaccinationDrives.driveName"),
            sortable: true,
            render: (drive: VaccinationDrive) => drive.name,
        },
        {
            id: "date",
            label: t("vaccinationDrives.driveDate"),
            sortable: true,
            render: (drive: VaccinationDrive) =>
                new Date(drive.date).toLocaleDateString(),
        },
        {
            id: "availableDoses",
            label: t("vaccinationDrives.availableDoses"),
            sortable: true,
            render: (drive: VaccinationDrive) => drive.availableDoses,
        },
        {
            id: "applicableClasses",
            label: t("vaccinationDrives.applicableClasses"),
            sortable: true,
            render: (drive: VaccinationDrive) => (
                <Box>
                    {drive.applicableClasses.split(",").map((cls: string) => (
                        <Chip
                            key={cls}
                            label={`Class ${cls.trim()}`}
                            size="small"
                            sx={{ mr: 0.5, mb: 0.5 }}
                        />
                    ))}
                </Box>
            ),
        },
        {
            id: "status",
            label: t("vaccinationDrives.status.title"),
            sortable: false,
            render: (drive: VaccinationDrive) => {
                const isPast = isDrivePast(drive.date);
                return (
                    <Chip
                        label={
                            isPast
                                ? t("vaccinationDrives.completed")
                                : t("vaccinationDrives.upcoming")
                        }
                        sx={{
                            backgroundColor: isPast
                                ? theme.palette.custom.green
                                : theme.palette.custom.blue,
                        }}
                        size="small"
                    />
                );
            },
        },
        {
            id: "actions",
            label: t("vaccinationDrives.actions"),
            sortable: false,
            render: (drive: VaccinationDrive) => {
                const isPast = isDrivePast(drive.date);
                return (
                    <Box>
                        <IconButton
                            color="primary"
                            onClick={() => handleOpenEditDialog(drive.id)}
                            disabled={isPast}
                            title={
                                isPast
                                    ? t(
                                          "vaccinationDrives.cannotEditPastDrives"
                                      )
                                    : t("vaccinationDrives.editDrive")
                            }
                        >
                            <EditIcon />
                        </IconButton>
                        <IconButton
                            color="error"
                            onClick={() => handleOpenDeleteDialog(drive.id)}
                            disabled={isPast}
                            title={
                                isPast
                                    ? t(
                                          "vaccinationDrives.cannotDeletePastDrives"
                                      )
                                    : t("vaccinationDrives.deleteDrive")
                            }
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Box>
                );
            },
        },
    ];

    // Handle sort change
    const handleSortChange = (field: string, direction: SortDirection) => {
        setSortField(field);
        setSortDirection(direction);
    };

    const filtersAppliedCount =
        (nameFilter ? 1 : 0) +
        (classFilter !== "all" ? 1 : 0) +
        (statusFilter !== "all" ? 1 : 0) +
        (upcomingOnly ? 1 : 0);

    return (
        <Box>
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                my={2}
            >
                <Typography variant="h4" component="h1">
                    {t("vaccinationDrives.title")}
                </Typography>
                <Box display="flex" gap={1}>
                    <Badge
                        color="primary"
                        badgeContent={
                            filtersAppliedCount > 0
                                ? filtersAppliedCount
                                : undefined
                        }
                        invisible={filtersAppliedCount === 0}
                        anchorOrigin={{ vertical: "top", horizontal: "right" }}
                    >
                        <Button
                            variant="outlined"
                            startIcon={
                                showFilters ? <ClearIcon /> : <FilterListIcon />
                            }
                            onClick={toggleFilters}
                        >
                            {showFilters
                                ? t("vaccinationDrives.hideFilters")
                                : t("vaccinationDrives.showFilters")}
                        </Button>
                    </Badge>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenAddDialog}
                        sx={primaryButtonHoverSyles}
                    >
                        {t("vaccinationDrives.scheduleNewDrive")}
                    </Button>
                </Box>
            </Box>

            {pageError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {pageError}
                </Alert>
            )}

            {showFilters && (
                <VaccinationDriveFilters
                    nameFilter={nameFilter}
                    classFilter={classFilter}
                    statusFilter={statusFilter}
                    upcomingOnly={upcomingOnly}
                    loading={loading}
                    onFilterChange={handleFilterChange}
                    onClassFilterChange={handleClassFilterChange}
                    onStatusFilterChange={handleStatusFilterChange}
                    onToggleUpcomingFilter={toggleUpcomingFilter}
                    onClearFilters={clearFilters}
                    classOptions={classOptions}
                />
            )}

            {loading && drives.length === 0 ? (
                <TableSkeleton columns={columns} rowsPerPage={rowsPerPage} />
            ) : (
                <SortableTable
                    columns={columns}
                    data={drives}
                    keyExtractor={(drive) => drive.id}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSortChange={handleSortChange}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    totalCount={totalCount}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    loading={loading}
                    emptyMessage={t(
                        "vaccinationDrives.noVaccinationDrivesFound"
                    )}
                />
            )}

            <VaccinationDriveDialogs
                openAddDialog={openAddDialog}
                openEditDialog={openEditDialog}
                openDeleteDialog={openDeleteDialog}
                formData={formData}
                formErrors={formErrors}
                modalError={modalError}
                loading={loading}
                minDriveDate={minDriveDate}
                classOptions={classOptions}
                onCloseDialogs={handleCloseDialogs}
                onInputChange={handleInputChange}
                onSelectChange={handleSelectChange}
                onDateChange={handleDateChange}
                onAddDrive={handleAddDrive}
                onEditDrive={handleEditDrive}
                onDeleteDrive={handleDeleteDrive}
            />
        </Box>
    );
};

export default VaccinationDrives;
