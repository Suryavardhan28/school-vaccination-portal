import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import {
    Box,
    CircularProgress,
    Table as MuiTable,
    Paper,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Typography,
} from "@mui/material";
import React, { ReactNode } from "react";

// Column definition type
export interface Column<T> {
    id: string;
    label: string;
    minWidth?: number;
    sortable?: boolean;
    render: (row: T) => ReactNode;
}

// Sort direction type
export type SortDirection = "asc" | "desc";

// Props for the sortable table
interface SortableTableProps<T> {
    columns: Column<T>[];
    data: T[];
    keyExtractor: (item: T) => string | number;
    sortField?: string;
    sortDirection?: SortDirection;
    onSortChange?: (field: string, direction: SortDirection) => void;
    page?: number;
    rowsPerPage?: number;
    totalCount?: number;
    onPageChange?: (event: unknown, newPage: number) => void;
    onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    loading?: boolean;
    emptyMessage?: string;
}

// Type guard for generic component
function SortableTable<T extends object>(props: SortableTableProps<T>) {
    const {
        columns,
        data,
        keyExtractor,
        sortField,
        sortDirection = "asc",
        onSortChange,
        page = 0,
        rowsPerPage = 10,
        totalCount = 0,
        onPageChange,
        onRowsPerPageChange,
        loading = false,
        emptyMessage = "No data found",
    } = props;

    // Handle sort change
    const handleSort = (field: string) => {
        if (!onSortChange) return;

        let newDirection: SortDirection = "asc";
        if (field === sortField) {
            newDirection = sortDirection === "asc" ? "desc" : "asc";
        }

        onSortChange(field, newDirection);
    };

    // Sortable table header cell component
    const TableSortLabel = ({
        label,
        field,
        sortable = true,
    }: {
        label: string;
        field: string;
        sortable?: boolean;
    }) => {
        const isActive = sortField === field;

        if (!sortable) {
            return <Typography fontWeight="bold">{label}</Typography>;
        }

        return (
            <Box
                onClick={() => sortable && handleSort(field)}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    cursor: sortable ? "pointer" : "default",
                    userSelect: "none",
                    fontWeight: "bold",
                    color: isActive ? "primary.main" : "inherit",
                }}
            >
                {label}
                {isActive ? (
                    sortDirection === "asc" ? (
                        <ArrowDropUpIcon color="primary" />
                    ) : (
                        <ArrowDropDownIcon color="primary" />
                    )
                ) : (
                    <ArrowDropDownIcon sx={{ opacity: 0.3 }} />
                )}
            </Box>
        );
    };

    return (
        <>
            <TableContainer component={Paper}>
                <MuiTable size="small">
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <TableCell
                                    key={column.id}
                                    style={{ minWidth: column.minWidth }}
                                    sx={{ py: 2 }}
                                >
                                    <TableSortLabel
                                        label={column.label}
                                        field={column.id}
                                        sortable={column.sortable !== false}
                                    />
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading && data.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    align="center"
                                    sx={{ py: 4 }}
                                >
                                    <CircularProgress size={32} />
                                </TableCell>
                            </TableRow>
                        ) : data.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    align="center"
                                    sx={{ py: 4 }}
                                >
                                    {emptyMessage}
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((row) => (
                                <TableRow
                                    hover
                                    tabIndex={-1}
                                    key={keyExtractor(row)}
                                >
                                    {columns.map((column) => (
                                        <TableCell key={column.id}>
                                            {column.render(row)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                        {loading && data.length > 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    align="center"
                                    sx={{ py: 2 }}
                                >
                                    <CircularProgress size={24} />
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </MuiTable>
            </TableContainer>

            {onPageChange && onRowsPerPageChange && (
                <TablePagination
                    component="div"
                    count={totalCount}
                    page={page}
                    onPageChange={onPageChange}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={onRowsPerPageChange}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                />
            )}
        </>
    );
}

export default SortableTable;
