import type { Request, Response } from 'express';
import type { Multer } from 'multer';
import { Op } from 'sequelize';
import { Student } from '../models';
import fs from 'fs';
import { parse } from 'csv-parse';
import path from 'path';

// Extended Request type for file upload
interface RequestWithFile extends Request {
    file?: Express.Multer.File;
}

// Get all students or filtered by search criteria
export const getStudents = async (req: Request, res: Response) => {
    try {
        const { name, studentId, class: studentClass, vaccinationStatus } = req.query;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = (page - 1) * limit;

        let whereCondition: any = {};

        if (name) {
            whereCondition.name = { [Op.like]: `%${name}%` };
        }

        if (studentId) {
            whereCondition.studentId = { [Op.like]: `%${studentId}%` };
        }

        if (studentClass) {
            whereCondition.class = { [Op.like]: `%${studentClass}%` };
        }

        // Vaccination status filter to be implemented with join
        // This is a placeholder and will need to be updated

        const { count, rows } = await Student.findAndCountAll({
            where: whereCondition,
            limit,
            offset,
            order: [['name', 'ASC']],
        });

        res.json({
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            students: rows,
        });
    } catch (error) {
        console.error('Error getting students:', error);
        res.status(500).json({ message: 'Failed to get students' });
    }
};

// Get a single student by ID
export const getStudentById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const student = await Student.findByPk(id);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json(student);
    } catch (error) {
        console.error('Error getting student:', error);
        res.status(500).json({ message: 'Failed to get student' });
    }
};

// Create a new student
export const createStudent = async (req: Request, res: Response) => {
    try {
        const { name, studentId, class: studentClass } = req.body;

        // Validate input
        if (!name || !studentId || !studentClass) {
            return res.status(400).json({ message: 'Name, ID, and class are required' });
        }

        // Check for existing student with same ID
        const existingStudent = await Student.findOne({ where: { studentId } });
        if (existingStudent) {
            return res.status(409).json({ message: 'Student ID already exists' });
        }

        const student = await Student.create({
            name,
            studentId,
            class: studentClass
        });

        res.status(201).json(student);
    } catch (error) {
        console.error('Error creating student:', error);
        res.status(500).json({ message: 'Failed to create student' });
    }
};

// Update a student
export const updateStudent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, studentId, class: studentClass } = req.body;

        const student = await Student.findByPk(id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // If studentId is changing, check it's not already used
        if (studentId && studentId !== student.get('studentId')) {
            const existingStudent = await Student.findOne({ where: { studentId } });
            if (existingStudent) {
                return res.status(409).json({ message: 'Student ID already exists' });
            }
        }

        await student.update({
            name: name || student.get('name'),
            studentId: studentId || student.get('studentId'),
            class: studentClass || student.get('class')
        });

        res.json(student);
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ message: 'Failed to update student' });
    }
};

// Delete a student
export const deleteStudent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const student = await Student.findByPk(id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        await student.destroy();

        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ message: 'Failed to delete student' });
    }
};

// Import students from CSV
export const importStudentsFromCSV = async (req: RequestWithFile, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No CSV file uploaded' });
        }

        const filePath = req.file.path;
        const results: any[] = [];

        // Parse CSV file
        fs.createReadStream(filePath)
            .pipe(parse({ delimiter: ',', columns: true, trim: true }))
            .on('data', (data: any) => {
                results.push(data);
            })
            .on('end', async () => {
                // Clean up temporary file
                fs.unlinkSync(filePath);

                try {
                    let successCount = 0;
                    let errorCount = 0;
                    const errors: string[] = [];

                    // Process each row
                    for (const row of results) {
                        try {
                            // Validate required fields
                            if (!row.name || !row.studentId || !row.class) {
                                errors.push(`Row with student ID ${row.studentId || 'unknown'}: Missing required fields`);
                                errorCount++;
                                continue;
                            }

                            // Check for existing student
                            const existingStudent = await Student.findOne({ where: { studentId: row.studentId } });
                            if (existingStudent) {
                                errors.push(`Student ID ${row.studentId} already exists`);
                                errorCount++;
                                continue;
                            }

                            // Create new student
                            await Student.create({
                                name: row.name,
                                studentId: row.studentId,
                                class: row.class
                            });

                            successCount++;
                        } catch (error) {
                            console.error('Error processing row:', error);
                            errors.push(`Error processing row for student ID ${row.studentId || 'unknown'}`);
                            errorCount++;
                        }
                    }

                    res.json({
                        message: 'CSV import completed',
                        totalProcessed: results.length,
                        successCount,
                        errorCount,
                        errors: errors.length > 0 ? errors : undefined
                    });
                } catch (error) {
                    console.error('Error during CSV import:', error);
                    res.status(500).json({ message: 'Error processing CSV data' });
                }
            })
            .on('error', (error: Error) => {
                console.error('Error parsing CSV:', error);
                res.status(500).json({ message: 'Error parsing CSV file' });
            });
    } catch (error) {
        console.error('Error importing students from CSV:', error);
        res.status(500).json({ message: 'Failed to import students from CSV' });
    }
}; 