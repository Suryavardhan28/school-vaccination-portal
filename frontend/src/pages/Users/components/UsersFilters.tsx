import {
    Button,
    Grid,
    MenuItem,
    Paper,
    Select,
    TextField,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

interface UsersFiltersProps {
    usernameFilter: string;
    setUsernameFilter: (val: string) => void;
    roleFilter: string;
    setRoleFilter: (val: string) => void;
    clearFilters: () => void;
    showFilters: boolean;
}

const UsersFilters: React.FC<UsersFiltersProps> = ({
    usernameFilter,
    setUsernameFilter,
    roleFilter,
    setRoleFilter,
    clearFilters,
    showFilters,
}) => {
    const { t } = useTranslation();
    if (!showFilters) return null;
    return (
        <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
                <Grid size={3}>
                    <TextField
                        label={t("users.searchByUsername")}
                        value={usernameFilter}
                        onChange={(e) => setUsernameFilter(e.target.value)}
                        size="small"
                        fullWidth
                    />
                </Grid>
                <Grid size={3}>
                    <Select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        size="small"
                        fullWidth
                    >
                        <MenuItem value="all">{t("users.all")}</MenuItem>
                        <MenuItem value="admin">{t("users.admin")}</MenuItem>
                        <MenuItem value="coordinator">
                            {t("users.coordinator")}
                        </MenuItem>
                    </Select>
                </Grid>
                <Grid flexGrow={1} />
                <Grid size={2}>
                    <Button
                        variant="outlined"
                        onClick={clearFilters}
                        size="large"
                        fullWidth
                    >
                        {t("users.clearFilters")}
                    </Button>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default UsersFilters;
