import api from './api';
import { Student } from './studentService';
import { VaccinationDrive } from './vaccinationDriveService';

export interface Vaccination {
    id: number;
    studentId: number;
    driveId: number;
    vaccinationDate: string;
    createdAt: string;
    updatedAt: string;
    Student?: Student;
    VaccinationDrive?: VaccinationDrive;
}

export interface VaccinationCreateRequest {
    studentId: number;
    driveId: number;
    vaccinationDate: string;
}

interface VaccinationsResponse {
    total: number;
    totalPages: number;
    currentPage: number;
    vaccinations: Vaccination[];
}

export interface VaccinationFilters {
    studentId?: string;
    driveId?: number;
    vaccineName?: string;
}

export interface VaccinationStatistics {
    totalStudents: number;
    vaccinatedStudents: number;
    vaccinationPercentage: number;
    upcomingDrives: VaccinationDrive[] | null;
}

export const getVaccinations = async (
    page = 1,
    limit = 10,
    filters?: VaccinationFilters
): Promise<VaccinationsResponse> => {
    try {
        const params = { page, limit, ...filters };
        const response = await api.get<VaccinationsResponse>('/vaccinations', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching vaccinations:', error);
        throw error;
    }
};

export const getVaccinationById = async (id: number): Promise<Vaccination> => {
    try {
        const response = await api.get<Vaccination>(`/vaccinations/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching vaccination with id ${id}:`, error);
        throw error;
    }
};

export const createVaccination = async (
    vaccinationData: VaccinationCreateRequest
): Promise<Vaccination> => {
    try {
        const response = await api.post<Vaccination>('/vaccinations', vaccinationData);
        return response.data;
    } catch (error) {
        console.error('Error creating vaccination:', error);
        throw error;
    }
};

export const deleteVaccination = async (id: number): Promise<void> => {
    try {
        await api.delete(`/vaccinations/${id}`);
    } catch (error) {
        console.error(`Error deleting vaccination with id ${id}:`, error);
        throw error;
    }
};

export const getVaccinationStatistics = async (): Promise<VaccinationStatistics> => {
    try {
        const response = await api.get<VaccinationStatistics>('/vaccinations/statistics');
        return response.data;
    } catch (error) {
        console.error('Error fetching vaccination statistics:', error);
        throw error;
    }
}; 