import api from "./api";

export const downloadVaccinationReport = async (): Promise<Blob> => {
    try {
        const response = await api.get("/reports/vaccination", {
            responseType: "blob",
        });
        return response.data;
    } catch (error) {
        console.error("Error downloading vaccination report:", error);
        throw error;
    }
};

export const downloadDriveSummaryReport = async (): Promise<Blob> => {
    try {
        const response = await api.get("/reports/drive-summary", {
            responseType: "blob",
        });
        return response.data;
    } catch (error) {
        console.error("Error downloading drive summary report:", error);
        throw error;
    }
};

export const downloadClassWiseReport = async (): Promise<Blob> => {
    try {
        const response = await api.get("/reports/class-wise", {
            responseType: "blob",
        });
        return response.data;
    } catch (error) {
        console.error("Error downloading class-wise report:", error);
        throw error;
    }
};

export const downloadUnvaccinatedReport = async (): Promise<Blob> => {
    try {
        const response = await api.get("/reports/unvaccinated", {
            responseType: "blob",
        });
        return response.data;
    } catch (error) {
        console.error("Error downloading unvaccinated students report:", error);
        throw error;
    }
};
