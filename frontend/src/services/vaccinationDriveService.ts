import api from "./api";

export interface VaccinationDrive {
    id: number;
    name: string;
    date: string;
    availableDoses: number;
    applicableClasses: string; // Comma-separated classes (e.g., "5,6,7")
    createdAt: string;
    updatedAt: string;
    isWithin30Days?: boolean; // Add this flag for the dashboard
}

interface VaccinationDrivesResponse {
    total: number;
    totalPages: number;
    currentPage: number;
    vaccinationDrives: VaccinationDrive[];
}

interface VaccinationDrivesParams {
    page?: number;
    limit?: number;
    upcoming?: boolean;
    name?: string;
    class?: string;
    status?: string;
    sortField?: string;
    sortDirection?: "asc" | "desc";
}

export const getVaccinationDrives = async (
    page = 1,
    limit = 10,
    params?: VaccinationDrivesParams
): Promise<VaccinationDrivesResponse> => {
    try {
        const queryParams = {
            page,
            limit,
            ...params,
        };
        const response = await api.get<VaccinationDrivesResponse>(
            "/vaccination-drives",
            { params: queryParams }
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching vaccination drives:", error);
        throw error;
    }
};

export const getVaccinationDriveById = async (
    id: number
): Promise<VaccinationDrive> => {
    try {
        const response = await api.get<VaccinationDrive>(
            `/vaccination-drives/${id}`
        );
        return response.data;
    } catch (error) {
        console.error(`Error fetching vaccination drive with id ${id}:`, error);
        throw error;
    }
};

export const createVaccinationDrive = async (
    driveData: Omit<VaccinationDrive, "id" | "createdAt" | "updatedAt">
): Promise<VaccinationDrive> => {
    try {
        const response = await api.post<VaccinationDrive>(
            "/vaccination-drives",
            driveData
        );
        return response.data;
    } catch (error) {
        console.error("Error creating vaccination drive:", error);
        throw error;
    }
};

export const updateVaccinationDrive = async (
    id: number,
    driveData: Partial<Omit<VaccinationDrive, "id" | "createdAt" | "updatedAt">>
): Promise<VaccinationDrive> => {
    try {
        const response = await api.put<VaccinationDrive>(
            `/vaccination-drives/${id}`,
            driveData
        );
        return response.data;
    } catch (error) {
        console.error(`Error updating vaccination drive with id ${id}:`, error);
        throw error;
    }
};

export const deleteVaccinationDrive = async (id: number): Promise<void> => {
    try {
        await api.delete(`/vaccination-drives/${id}`);
    } catch (error) {
        console.error(`Error deleting vaccination drive with id ${id}:`, error);
        throw error;
    }
};

export const getVaccinationDrivesDropdown = async (): Promise<
    VaccinationDrive[]
> => {
    const response = await api.get<{ vaccinationDrives: VaccinationDrive[] }>(
        "/vaccination-drives?dropdown=true"
    );
    return response.data.vaccinationDrives;
};
