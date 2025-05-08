import express from 'express';
import {
    getVaccinationDrives,
    getVaccinationDriveById,
    createVaccinationDrive,
    updateVaccinationDrive,
    deleteVaccinationDrive
} from '../controllers/vaccinationDriveController';
import { authenticateToken } from '../middlewares/auth';

const router = express.Router();

// Vaccination drive routes with authentication
router.get('/', authenticateToken as any, getVaccinationDrives as any);
router.get('/:id', authenticateToken as any, getVaccinationDriveById as any);
router.post('/', authenticateToken as any, createVaccinationDrive as any);
router.put('/:id', authenticateToken as any, updateVaccinationDrive as any);
router.delete('/:id', authenticateToken as any, deleteVaccinationDrive as any);

export default router; 