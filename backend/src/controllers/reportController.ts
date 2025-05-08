import type { Request, Response } from 'express';
import { Vaccination, Student, VaccinationDrive } from '../models';
import { Op } from 'sequelize';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

// Type for Vaccination with related models
interface VaccinationWithRelations extends Vaccination {
    Student?: Student;
    VaccinationDrive?: VaccinationDrive;
}

// Generate and return a full vaccination report (Excel format)
export const generateVaccinationReport = async (req: Request, res: Response) => {
    try {
        console.log(`[${new Date().toISOString()}] Starting report generation...`);

        // Prepare data for the report
        const [
            totalStudents,
            vaccinatedStudentsCount,
            vaccinations,
            allDrives
        ] = await Promise.all([
            // Get total students count
            Student.count(),

            // Get unique vaccinated students count
            Vaccination.count({
                distinct: true,
                col: 'studentId'
            }),

            // Get all vaccinations with related data
            Vaccination.findAll({
                include: [
                    {
                        model: Student,
                        attributes: ['id', 'name', 'studentId', 'class']
                    },
                    {
                        model: VaccinationDrive,
                        attributes: ['id', 'name', 'date', 'availableDoses', 'applicableClasses']
                    }
                ],
                order: [['vaccinationDate', 'DESC']],
            }),

            // Get ALL vaccination drives (not just upcoming)
            VaccinationDrive.findAll({
                order: [['date', 'DESC']]
            })
        ]);

        // Convert to plain objects to avoid Sequelize model issues
        const vaccinationsData = vaccinations.map(v => v.get({ plain: true }));
        const drivesData = allDrives.map(d => d.get({ plain: true }));

        console.log(`[${new Date().toISOString()}] Data fetched successfully. Vaccinations: ${vaccinationsData.length}, Drives: ${drivesData.length}`);

        // Sample logging to debug the data structure
        if (vaccinationsData.length > 0) {
            console.log(`[${new Date().toISOString()}] Sample vaccination record:`,
                JSON.stringify(vaccinationsData[0], null, 2));
        }

        // Calculate vaccination percentage
        const vaccinationPercentage = totalStudents > 0
            ? Math.round((vaccinatedStudentsCount / totalStudents) * 100)
            : 0;

        // Create Excel workbook
        const wb = XLSX.utils.book_new();

        // Create statistics sheet
        const statisticsData = [
            { Metric: 'Report Generation Date', Value: new Date().toLocaleString() },
            { Metric: 'Total Students', Value: totalStudents },
            { Metric: 'Vaccinated Students', Value: vaccinatedStudentsCount },
            { Metric: 'Vaccination Rate', Value: `${vaccinationPercentage}%` },
            { Metric: 'Total Vaccinations', Value: vaccinationsData.length },
            { Metric: 'Total Vaccination Drives', Value: drivesData.length }
        ];

        const statisticsSheet = XLSX.utils.json_to_sheet(statisticsData);
        XLSX.utils.book_append_sheet(wb, statisticsSheet, 'Statistics');

        // Helper function to safely format dates
        const formatDate = (dateString: string | Date | undefined | null): string => {
            if (!dateString) return 'Not Available';
            try {
                const date = dateString instanceof Date ? dateString : new Date(dateString);
                // Check if date is valid
                if (isNaN(date.getTime())) return 'Not Available';
                return date.toISOString().split('T')[0]; // YYYY-MM-DD format
            } catch (error) {
                return 'Not Available';
            }
        };

        // Create vaccinations sheet
        const vaccinationRecords = vaccinationsData.map(v => {
            return {
                'Vaccination ID': v.id || 'N/A',
                'Student ID': v.Student?.studentId || 'N/A',
                'Student Name': v.Student?.name || 'N/A',
                'Class': v.Student?.class || 'N/A',
                'Vaccination Drive': v.VaccinationDrive?.name || 'N/A',
                'Vaccination Date': formatDate(v.vaccinationDate),
                'Drive Date': formatDate(v.VaccinationDrive?.date)
            };
        });

        const vaccinationsSheet = XLSX.utils.json_to_sheet(vaccinationRecords);
        XLSX.utils.book_append_sheet(wb, vaccinationsSheet, 'Vaccination Records');

        // Create drives sheet (ALL drives, not just upcoming)
        const drivesReport = drivesData.map(drive => {
            return {
                'Drive ID': drive.id || 'N/A',
                'Drive Name': drive.name || 'N/A',
                'Date': formatDate(drive.date),
                'Available Doses': drive.availableDoses || 0,
                'Applicable Classes': drive.applicableClasses || 'None',
                'Status': new Date(drive.date) > new Date() ? 'Upcoming' : 'Completed'
            };
        });

        const drivesSheet = XLSX.utils.json_to_sheet(drivesReport);
        XLSX.utils.book_append_sheet(wb, drivesSheet, 'Vaccination Drives');

        // Class-based statistics
        const classData = await Student.findAll({
            attributes: ['class'],
            group: ['class'],
            raw: true
        });

        const classStats: Array<{
            'Class': string;
            'Total Students': number;
            'Vaccinated Students': number;
            'Vaccination Rate': string;
        }> = [];

        for (const classItem of classData) {
            const className = classItem.class;
            const studentsInClass = await Student.count({ where: { class: className } });
            const vaccinatedStudentsInClass = await Vaccination.count({
                distinct: true,
                col: 'studentId',
                include: [{
                    model: Student,
                    where: { class: className },
                    attributes: []
                }]
            });

            const classVaccinationPercentage = studentsInClass > 0
                ? Math.round((vaccinatedStudentsInClass / studentsInClass) * 100)
                : 0;

            classStats.push({
                'Class': className,
                'Total Students': studentsInClass,
                'Vaccinated Students': vaccinatedStudentsInClass,
                'Vaccination Rate': `${classVaccinationPercentage}%`
            });
        }

        const classStatsSheet = XLSX.utils.json_to_sheet(classStats);
        XLSX.utils.book_append_sheet(wb, classStatsSheet, 'Class Statistics');

        // Ensure reports directory exists
        const reportDir = path.join(__dirname, '../../reports');
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }

        // Generate excel file
        const reportFileName = `Vaccination_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
        const reportPath = path.join(reportDir, reportFileName);

        // Write file
        XLSX.writeFile(wb, reportPath);

        console.log(`[${new Date().toISOString()}] Report generated: ${reportPath}`);

        // Send file to client
        res.download(reportPath, reportFileName, (err) => {
            if (err) {
                console.error(`[${new Date().toISOString()}] Error sending report:`, err);
            }

            // Clean up file after sending
            fs.unlink(reportPath, (unlinkErr) => {
                if (unlinkErr) {
                    console.error(`[${new Date().toISOString()}] Error removing temporary report file:`, unlinkErr);
                }
            });
        });
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR in generateVaccinationReport:`, error);
        res.status(500).json({ message: 'Failed to generate vaccination report' });
    }
}; 