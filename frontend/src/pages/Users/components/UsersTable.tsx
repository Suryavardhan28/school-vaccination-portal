import React from "react";
import SortableTable, {
    Column,
    SortDirection,
} from "../../../components/SortableTable";
import { User } from "../../../services/authService";

interface UsersTableProps {
    users: User[];
    columns: Column<User>[];
    loading: boolean;
    sortField: string;
    sortDirection: SortDirection;
    onSortChange: (field: string, direction: SortDirection) => void;
    page: number;
    rowsPerPage: number;
    totalCount: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    emptyMessage: string;
}

const UsersTable: React.FC<UsersTableProps> = ({
    users,
    columns,
    loading,
    sortField,
    sortDirection,
    onSortChange,
    page,
    rowsPerPage,
    totalCount,
    onPageChange,
    onRowsPerPageChange,
    emptyMessage,
}) => {
    return (
        <SortableTable
            columns={columns}
            data={users}
            keyExtractor={(u) => u.id}
            sortField={sortField}
            sortDirection={sortDirection}
            onSortChange={onSortChange}
            loading={loading}
            emptyMessage={emptyMessage}
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={totalCount}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
        />
    );
};

export default UsersTable;
