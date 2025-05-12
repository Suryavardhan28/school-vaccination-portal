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
    Snackbar,
    Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { primaryButtonHoverSyles } from "../../common/styles/primaryButtonHover";
import { Column, SortDirection } from "../../components/SortableTable";
import { useAuth } from "../../contexts/AuthContext";
import {
    createUser,
    getUsers,
    updateUser,
    User,
} from "../../services/authService";
import ConfirmDialog from "./components/ConfirmDialog";
import UserDialog from "./components/UserDialog";
import UsersFilters from "./components/UsersFilters";
import UsersTable from "./components/UsersTable";

// Helper type guard for API error
function isApiError(
    err: unknown
): err is { response: { data: { message?: string } } } {
    if (!err || typeof err !== "object") return false;
    const e = err as Record<string, unknown>;
    if (
        !("response" in e) ||
        typeof e.response !== "object" ||
        e.response === null
    )
        return false;
    const response = e.response as Record<string, unknown>;
    if (
        !("data" in response) ||
        typeof response.data !== "object" ||
        response.data === null
    )
        return false;
    return true;
}

const Users = () => {
    const { t } = useTranslation();
    const { user: currentUser } = useAuth();

    // State
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [editUser, setEditUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        role: "coordinator",
    });
    const [sortField, setSortField] = useState<string>("username");
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
    const [usernameFilter, setUsernameFilter] = useState("");
    const [userIdFilter, setUserIdFilter] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("all");
    const [showFilters, setShowFilters] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        type: "delete" | "edit" | "create" | null;
        user?: User | null;
    }>({ open: false, type: null, user: null });
    const [showError, setShowError] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [dialogError, setDialogError] = useState<string>("");

    // Handlers
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await getUsers(page + 1, rowsPerPage, {
                username: usernameFilter || undefined,
                role: roleFilter !== "all" ? roleFilter : undefined,
                userId: userIdFilter || undefined,
                sortField,
                sortDirection,
            });
            setUsers(response.users);
            setTotalCount(response.total);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        page,
        rowsPerPage,
        usernameFilter,
        roleFilter,
        userIdFilter,
        sortField,
        sortDirection,
    ]);

    const handleOpenDialog = (user?: User) => {
        setDialogError("");
        if (user) {
            setEditUser(user);
            setFormData({
                username: user.username,
                password: "",
                role: user.role,
            });
        } else {
            setEditUser(null);
            setFormData({ username: "", password: "", role: "coordinator" });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setDialogError("");
    };

    const handleSave = async () => {
        setActionLoading(true);
        try {
            if (editUser) {
                await updateUser(editUser.id, formData);
            } else {
                await createUser(formData);
            }
            setOpenDialog(false);
            fetchUsers();
        } catch (err: unknown) {
            let message = t("error.unknown");
            if (isApiError(err) && err.response.data.message) {
                message = err.response.data.message;
            }
            setDialogError(message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (id === currentUser?.id) return;
        const user = users.find((u) => u.id === id) || null;
        setConfirmDialog({ open: true, type: "delete", user });
    };

    const handleConfirm = async () => {
        if (confirmDialog.type === "delete" && confirmDialog.user) {
            setActionLoading(true);
            try {
                await import("../../services/authService").then(
                    ({ deleteUser }) => deleteUser(confirmDialog.user!.id)
                );
                fetchUsers();
                setConfirmDialog({ open: false, type: null, user: null });
            } catch (err: unknown) {
                let message = t("error.unknown");
                if (isApiError(err) && err.response.data.message) {
                    message = err.response.data.message;
                }
                setDialogError(message);
            } finally {
                setActionLoading(false);
            }
        } else {
            setConfirmDialog({ open: false, type: null, user: null });
        }
    };

    const handleCancelConfirm = () => {
        setConfirmDialog({ open: false, type: null, user: null });
    };

    const toggleFilters = () => {
        setShowFilters((prev) => !prev);
    };

    const handlePageChange = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const clearFilters = () => {
        setUsernameFilter("");
        setUserIdFilter("");
        setRoleFilter("all");
        setPage(0);
    };

    const filtersAppliedCount =
        (usernameFilter ? 1 : 0) +
        (userIdFilter ? 1 : 0) +
        (roleFilter !== "all" ? 1 : 0);

    // Columns
    const columns: Column<User>[] = [
        {
            id: "id",
            label: t("users.userId"),
            sortable: true,
            render: (row) => row.id,
        },
        {
            id: "username",
            label: t("users.username"),
            sortable: true,
            render: (row) => row.username,
        },
        {
            id: "role",
            label: t("users.role"),
            sortable: true,
            render: (row) => (
                <Chip
                    label={t(`users.${row.role}`)}
                    color={row.role === "admin" ? "primary" : "default"}
                />
            ),
        },
        {
            id: "actions",
            label: t("users.actions"),
            sortable: false,
            render: (row) => (
                <>
                    <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(row)}
                        title={t("users.editUser")}
                        disabled={row.id === currentUser?.id}
                    >
                        <EditIcon />
                    </IconButton>
                    <IconButton
                        color="error"
                        onClick={() => handleDelete(row.id)}
                        disabled={row.id === currentUser?.id}
                        title={t("users.deleteUser")}
                    >
                        <DeleteIcon />
                    </IconButton>
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
                    {t("users.title")}
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
                                ? t("users.hideFilters")
                                : t("users.showFilters")}
                        </Button>
                    </Badge>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog()}
                        sx={primaryButtonHoverSyles}
                    >
                        {t("users.addUser")}
                    </Button>
                </Box>
            </Box>

            <UsersFilters
                usernameFilter={usernameFilter}
                setUsernameFilter={setUsernameFilter}
                userIdFilter={userIdFilter}
                setUserIdFilter={setUserIdFilter}
                roleFilter={roleFilter}
                setRoleFilter={setRoleFilter}
                clearFilters={clearFilters}
                showFilters={showFilters}
            />

            <UsersTable
                users={users}
                columns={columns}
                loading={loading}
                sortField={sortField}
                sortDirection={sortDirection}
                onSortChange={(f, d) => {
                    setSortField(f);
                    setSortDirection(d);
                }}
                page={page}
                rowsPerPage={rowsPerPage}
                totalCount={totalCount}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                emptyMessage={t("common.noData")}
            />

            <UserDialog
                open={openDialog}
                onClose={handleCloseDialog}
                onSave={handleSave}
                formData={formData}
                setFormData={setFormData}
                editUser={editUser}
                loading={actionLoading}
                error={dialogError}
            />
            <ConfirmDialog
                open={confirmDialog.open && confirmDialog.type === "delete"}
                title={t("users.deleteConfirm")}
                description={t("users.deleteConfirmMessage")}
                onConfirm={handleConfirm}
                onCancel={handleCancelConfirm}
                loading={actionLoading}
                confirmText={t("users.delete")}
                cancelText={t("users.cancel")}
            />
            <Snackbar
                open={showError}
                autoHideDuration={6000}
                onClose={() => setShowError(false)}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert severity="error" onClose={() => setShowError(false)}>
                    {dialogError}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Users;
