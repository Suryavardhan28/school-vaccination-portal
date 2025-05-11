import {
    Box,
    Paper,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@mui/material";
import React from "react";

interface Column {
    id: string;
    label: string;
    sortable?: boolean;
    minWidth?: number;
}

interface TableSkeletonProps {
    columns: Column[];
    rowsPerPage: number;
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({
    columns,
    rowsPerPage,
}) => {
    // Calculate column widths
    const actionColumns = columns.filter((col) => col.id === "actions").length;
    const dataColumns = columns.length - actionColumns;
    const actionColumnWidth = 120; // Fixed width for action columns

    return (
        <TableContainer component={Paper}>
            <Table sx={{ tableLayout: "fixed", width: "100%" }}>
                <TableHead>
                    <TableRow>
                        {columns.map((column) => (
                            <TableCell
                                key={column.id}
                                style={{ minWidth: column.minWidth }}
                                sx={{
                                    width:
                                        column.id === "actions"
                                            ? actionColumnWidth
                                            : `calc((100% - ${
                                                  actionColumnWidth *
                                                  actionColumns
                                              }px) / ${dataColumns})`,
                                }}
                            >
                                <Box
                                    display="flex"
                                    alignItems="center"
                                    gap={1}
                                    sx={{
                                        fontWeight: "bold",
                                        color: "inherit",
                                    }}
                                >
                                    {column.label}
                                    {column.sortable && (
                                        <Skeleton
                                            variant="circular"
                                            width={16}
                                            height={16}
                                        />
                                    )}
                                </Box>
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {Array.from(new Array(rowsPerPage)).map((_, index) => (
                        <TableRow key={index} hover tabIndex={-1}>
                            {columns.map((column) => (
                                <TableCell
                                    key={`${index}-${column.id}`}
                                    sx={{
                                        width:
                                            column.id === "actions"
                                                ? actionColumnWidth
                                                : `calc((100% - ${
                                                      actionColumnWidth *
                                                      actionColumns
                                                  }px) / ${dataColumns})`,
                                        py: 1.5, // Match the padding of SortableTable rows
                                    }}
                                >
                                    <Skeleton
                                        variant="text"
                                        width={
                                            column.id === "actions"
                                                ? 100
                                                : "100%"
                                        }
                                        height={24} // Match the height of typical table content
                                    />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default TableSkeleton;
