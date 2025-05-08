import express from 'express';
import multer from 'multer';
import path from 'path';
import {
    getStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
    importStudentsFromCSV
} from '../controllers/studentController';
import { authenticateToken } from '../middlewares/auth';

const router = express.Router();

// Setup multer for CSV file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../uploads'));
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Accept only csv files
        if (file.mimetype === 'text/csv' ||
            file.originalname.endsWith('.csv')) {
            cb(null, true);
        } else {
            cb(new Error('Only CSV files are allowed'));
        }
    }
});

// Student routes with authentication
router.get('/', authenticateToken as any, getStudents as any);
router.get('/:id', authenticateToken as any, getStudentById as any);
router.post('/', authenticateToken as any, createStudent as any);
router.put('/:id', authenticateToken as any, updateStudent as any);
router.delete('/:id', authenticateToken as any, deleteStudent as any);
router.post('/import', authenticateToken as any, upload.single('file') as any, importStudentsFromCSV as any);

export default router; 