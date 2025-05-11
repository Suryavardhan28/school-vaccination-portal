import express from "express";
import {
    createVaccination,
    deleteVaccination,
    getClassesDropdown,
    getVaccinationById,
    getVaccinations,
    getVaccinationStatistics,
    updateVaccination,
} from "../controllers/vaccinationController";
import { authenticateToken } from "../middlewares/auth";

const router = express.Router();

// Vaccination routes with authentication
router.get("/", authenticateToken as any, getVaccinations as any);
router.get(
    "/statistics",
    authenticateToken as any,
    getVaccinationStatistics as any
);
router.get("/classes", getClassesDropdown);
router.get("/:id", authenticateToken as any, getVaccinationById as any);
router.post("/", authenticateToken as any, createVaccination as any);
router.delete("/:id", authenticateToken as any, deleteVaccination as any);
router.put("/:id", authenticateToken as any, updateVaccination as any);

export default router;
