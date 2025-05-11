import express from "express";
import {
    generateClassWiseReport,
    generateDriveSummaryReport,
    generateUnvaccinatedReport,
    generateVaccinationReport,
} from "../controllers/reportController";
import { authenticateToken } from "../middlewares/auth";

const router = express.Router();

// Report routes with authentication
router.get(
    "/vaccination",
    authenticateToken as any,
    generateVaccinationReport as any
);
router.get(
    "/drive-summary",
    authenticateToken as any,
    generateDriveSummaryReport as any
);
router.get(
    "/class-wise",
    authenticateToken as any,
    generateClassWiseReport as any
);
router.get(
    "/unvaccinated",
    authenticateToken as any,
    generateUnvaccinatedReport as any
);

export default router;
