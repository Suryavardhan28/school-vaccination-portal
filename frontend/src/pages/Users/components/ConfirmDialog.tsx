import { Check as CheckIcon } from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
} from "@mui/material";
import React from "react";

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    description?: string;
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
    confirmText?: string;
    cancelText?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    open,
    title,
    description,
    onConfirm,
    onCancel,
    loading,
    confirmText = "Confirm",
    cancelText = "Cancel",
}) => (
    <Dialog open={open} onClose={onCancel}>
        <DialogTitle>{title}</DialogTitle>
        {description && (
            <DialogContent>
                <Typography>{description}</Typography>
            </DialogContent>
        )}
        <DialogActions>
            <Button onClick={onCancel} disabled={loading}>
                {cancelText}
            </Button>
            <LoadingButton
                onClick={onConfirm}
                color="error"
                variant="contained"
                loading={loading}
                startIcon={<CheckIcon />}
            >
                {confirmText}
            </LoadingButton>
        </DialogActions>
    </Dialog>
);

export default ConfirmDialog;
