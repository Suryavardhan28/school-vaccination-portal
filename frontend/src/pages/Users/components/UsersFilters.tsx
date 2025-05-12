import {
    Button,
    FormControl,
    Grid,
    InputLabel,
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
    userIdFilter: string;
    setUserIdFilter: (val: string) => void;
    roleFilter: string;
    setRoleFilter: (val: string) => void;
    clearFilters: () => void;
    showFilters: boolean;
}

const UsersFilters: React.FC<UsersFiltersProps> = ({
    usernameFilter,
    setUsernameFilter,
    userIdFilter,
    setUserIdFilter,
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
                        label={t("users.searchByUserId")}
                        value={userIdFilter}
                        onChange={(e) => setUserIdFilter(e.target.value)}
                        size="small"
                        fullWidth
                    />
                </Grid>
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
                    <FormControl fullWidth size="small">
                        <InputLabel id="role-filter-label">
                            {t("users.searchByRole")}
                        </InputLabel>
                        <Select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            size="small"
                            fullWidth
                            labelId="role-filter-label"
                            name="roleFilter"
                            label={t("users.searchByRole")}
                        >
                            <MenuItem value="all">
                                <em>{t("users.allRoles")}</em>
                            </MenuItem>
                            <MenuItem value="admin">
                                {t("users.admin")}
                            </MenuItem>
                            <MenuItem value="coordinator">
                                {t("users.coordinator")}
                            </MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid flexGrow={1} />
                <Grid size={2}>
                    <Button
                        disabled={
                            !usernameFilter &&
                            !userIdFilter &&
                            roleFilter === "all"
                        }
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
