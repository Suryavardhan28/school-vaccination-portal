import express from 'express';
import { generateVaccinationReport } from '../controllers/reportController';
import { authenticateToken } from '../middlewares/auth';

const router = express.Router();

// Apply authentication middleware to all report routes
router.use(authenticateToken);

// Report routes
router.get('/vaccination-report', generateVaccinationReport);

export default router; 