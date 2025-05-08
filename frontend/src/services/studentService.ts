import api from './api';

export interface Student {
    id: number;
    name: string;
    studentId: string;
    class: string;
    createdAt: string;
    updatedAt: string;
}

interface StudentsResponse {
    total: number;
    totalPages: number;
    currentPage: number;
    students: Student[];
}

export const getStudents = async (
    page = 1,
    limit = 10,
    search?: { name?: string; studentId?: string; class?: string; }
): Promise<StudentsResponse> => {
    try {
        const params = { page, limit, ...search };
        const response = await api.get<StudentsResponse>('/students', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching students:', error);
        throw error;
    }
};

export const getStudentById = async (id: number): Promise<Student> => {
    try {
        const response = await api.get<Student>(`/students/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching student with id ${id}:`, error);
        throw error;
    }
};

export const createStudent = async (studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>): Promise<Student> => {
    try {
        const response = await api.post<Student>('/students', studentData);
        return response.data;
    } catch (error) {
        console.error('Error creating student:', error);
        throw error;
    }
};

export const updateStudent = async (
    id: number,
    studentData: Partial<Omit<Student, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Student> => {
    try {
        const response = await api.put<Student>(`/students/${id}`, studentData);
        return response.data;
    } catch (error) {
        console.error(`Error updating student with id ${id}:`, error);
        throw error;
    }
};

export const deleteStudent = async (id: number): Promise<void> => {
    try {
        await api.delete(`/students/${id}`);
    } catch (error) {
        console.error(`Error deleting student with id ${id}:`, error);
        throw error;
    }
};

export const importStudentsFromCSV = async (file: File): Promise<any> => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/students/import', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    } catch (error) {
        console.error('Error importing students from CSV:', error);
        throw error;
    }
}; 