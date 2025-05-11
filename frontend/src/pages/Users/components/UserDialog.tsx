import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Select,
    SelectChangeEvent,
    TextField,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { User } from "../../../services/authService";

interface UserDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: () => void;
    formData: { username: string; password: string; role: string };
    setFormData: React.Dispatch<
        React.SetStateAction<{
            username: string;
            password: string;
            role: string;
        }>
    >;
    editUser: User | null;
    loading?: boolean;
    error?: string;
}

const UserDialog: React.FC<UserDialogProps> = ({
    open,
    onClose,
    onSave,
    formData,
    setFormData,
    editUser,
    loading,
    error,
}) => {
    const { t } = useTranslation();
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    const handleSelectChange = (e: SelectChangeEvent<string>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>
                {editUser ? t("users.editUser") : t("users.addUser")}
            </DialogTitle>
            <DialogContent
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    minWidth: 500,
                    my: 2,
                }}
            >
                {error && <Alert severity="error">{error}</Alert>}
                {editUser && (
                    <TextField
                        label={t("users.userId")}
                        value={editUser.id}
                        fullWidth
                        InputProps={{ readOnly: true }}
                        variant="filled"
                    />
                )}
                <TextField
                    label={t("users.username")}
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    fullWidth
                />
                {!editUser && (
                    <TextField
                        label={t("users.password")}
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        fullWidth
                        placeholder={editUser ? t("common.optional") : ""}
                    />
                )}
                <Select
                    label={t("users.role")}
                    name="role"
                    value={formData.role}
                    onChange={handleSelectChange}
                    fullWidth
                >
                    <MenuItem value="admin">{t("users.admin")}</MenuItem>
                    <MenuItem value="coordinator">
                        {t("users.coordinator")}
                    </MenuItem>
                </Select>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    {t("users.cancel")}
                </Button>
                <Button onClick={onSave} variant="contained" disabled={loading}>
                    {t("users.save")}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UserDialog;
