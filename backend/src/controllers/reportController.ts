import type { Request, Response } from "express";
import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";
import { Student, Vaccination, VaccinationDrive } from "../models";

// Type for Vaccination with related models
interface VaccinationWithRelations extends Vaccination {
    Student?: Student;
    VaccinationDrive?: VaccinationDrive;
}

// Generate and return a full vaccination report (Excel format)
export const generateVaccinationReport = async (
    req: Request,
    res: Response
) => {
    try {
        console.log(
            `[${new Date().toISOString()}] Starting report generation...`
        );

        // Prepare data for the report
        const [
            totalStudents,
            vaccinatedStudentsCount,
            vaccinations,
            allDrives,
        ] = await Promise.all([
            // Get total students count
            Student.count(),

            // Get unique vaccinated students count
            Vaccination.count({
                distinct: true,
                col: "studentId",
            }),

            // Get all vaccinations with related data
            Vaccination.findAll({
                include: [
                    {
                        model: Student,
                        attributes: ["id", "name", "studentId", "class"],
                    },
                    {
                        model: VaccinationDrive,
                        attributes: [
                            "id",
                            "name",
                            "date",
                            "availableDoses",
                            "applicableClasses",
                        ],
                    },
                ],
                order: [["vaccinationDate", "DESC"]],
            }),

            // Get ALL vaccination drives (not just upcoming)
            VaccinationDrive.findAll({
                order: [["date", "DESC"]],
            }),
        ]);

        // Convert to plain objects to avoid Sequelize model issues
        const vaccinationsData = vaccinations.map((v) =>
            v.get({ plain: true })
        );
        const drivesData = allDrives.map((d) => d.get({ plain: true }));

        console.log(
            `[${new Date().toISOString()}] Data fetched successfully. Vaccinations: ${
                vaccinationsData.length
            }, Drives: ${drivesData.length}`
        );

        // Sample logging to debug the data structure
        if (vaccinationsData.length > 0) {
            console.log(
                `[${new Date().toISOString()}] Sample vaccination record:`,
                JSON.stringify(vaccinationsData[0], null, 2)
            );
        }

        // Calculate vaccination percentage
        const vaccinationPercentage =
            totalStudents > 0
                ? Math.round((vaccinatedStudentsCount / totalStudents) * 100)
                : 0;

        // Create Excel workbook
        const wb = XLSX.utils.book_new();

        // Create statistics sheet
        const statisticsData = [
            {
                Metric: "Report Generation Date",
                Value: new Date().toLocaleString(),
            },
            { Metric: "Total Students", Value: totalStudents },
            { Metric: "Vaccinated Students", Value: vaccinatedStudentsCount },
            { Metric: "Vaccination Rate", Value: `${vaccinationPercentage}%` },
            { Metric: "Total Vaccinations", Value: vaccinationsData.length },
            { Metric: "Total Vaccination Drives", Value: drivesData.length },
        ];

        const statisticsSheet = XLSX.utils.json_to_sheet(statisticsData);
        XLSX.utils.book_append_sheet(wb, statisticsSheet, "Statistics");

        // Helper function to safely format dates
        const formatDate = (
            dateString: string | Date | undefined | null
        ): string => {
            if (!dateString) return "Not Available";
            try {
                const date =
                    dateString instanceof Date
                        ? dateString
                        : new Date(dateString);
                // Check if date is valid
                if (isNaN(date.getTime())) return "Not Available";
                return date.toISOString().split("T")[0]; // YYYY-MM-DD format
            } catch (error) {
                return "Not Available";
            }
        };

        // Create vaccinations sheet
        const vaccinationRecords = vaccinationsData.map((v) => {
            return {
                "Vaccination ID": v.id || "N/A",
                "Student ID": v.Student?.studentId || "N/A",
                "Student Name": v.Student?.name || "N/A",
                Class: v.Student?.class || "N/A",
                "Vaccination Drive": v.VaccinationDrive?.name || "N/A",
                "Vaccination Date": formatDate(v.vaccinationDate),
                "Drive Date": formatDate(v.VaccinationDrive?.date),
            };
        });

        const vaccinationsSheet = XLSX.utils.json_to_sheet(vaccinationRecords);
        XLSX.utils.book_append_sheet(
            wb,
            vaccinationsSheet,
            "Vaccination Records"
        );

        // Create drives sheet (ALL drives, not just upcoming)
        const drivesReport = drivesData.map((drive) => {
            return {
                "Drive ID": drive.id || "N/A",
                "Drive Name": drive.name || "N/A",
                Date: formatDate(drive.date),
                "Available Doses": drive.availableDoses || 0,
                "Applicable Classes": drive.applicableClasses || "None",
                Status:
                    new Date(drive.date) > new Date()
                        ? "Upcoming"
                        : "Completed",
            };
        });

        const drivesSheet = XLSX.utils.json_to_sheet(drivesReport);
        XLSX.utils.book_append_sheet(wb, drivesSheet, "Vaccination Drives");

        // Class-based statistics
        const classData = await Student.findAll({
            attributes: ["class"],
            group: ["class"],
            raw: true,
        });

        const classStats: Array<{
            Class: string;
            "Total Students": number;
            "Vaccinated Students": number;
            "Vaccination Rate": string;
        }> = [];

        for (const classItem of classData) {
            const className = classItem.class;
            const studentsInClass = await Student.count({
                where: { class: className },
            });
            const vaccinatedStudentsInClass = await Vaccination.count({
                distinct: true,
                col: "studentId",
                include: [
                    {
                        model: Student,
                        where: { class: className },
                        attributes: [],
                    },
                ],
            });

            const classVaccinationPercentage =
                studentsInClass > 0
                    ? Math.round(
                          (vaccinatedStudentsInClass / studentsInClass) * 100
                      )
                    : 0;

            classStats.push({
                Class: className,
                "Total Students": studentsInClass,
                "Vaccinated Students": vaccinatedStudentsInClass,
                "Vaccination Rate": `${classVaccinationPercentage}%`,
            });
        }

        const classStatsSheet = XLSX.utils.json_to_sheet(classStats);
        XLSX.utils.book_append_sheet(wb, classStatsSheet, "Class Statistics");

        // Ensure reports directory exists
        const reportDir = path.join(__dirname, "../../reports");
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }

        // Generate excel file
        const reportFileName = `Vaccination_Status_Report_${new Date()
            .toISOString()
            .replace(/[:.]/g, "-")}.xlsx`;
        const reportPath = path.join(reportDir, reportFileName);

        // Write file
        XLSX.writeFile(wb, reportPath);

        console.log(
            `[${new Date().toISOString()}] Report generated: ${reportPath}`
        );

        // Send file to client
        res.download(reportPath, reportFileName, (err) => {
            if (err) {
                console.error(
                    `[${new Date().toISOString()}] Error sending report:`,
                    err
                );
            }

            // Clean up file after sending
            fs.unlink(reportPath, (unlinkErr) => {
                if (unlinkErr) {
                    console.error(
                        `[${new Date().toISOString()}] Error removing temporary report file:`,
                        unlinkErr
                    );
                }
            });
        });
    } catch (error) {
        console.error(
            `[${new Date().toISOString()}] ERROR in generateVaccinationReport:`,
            error
        );
        res.status(500).json({
            message: "Failed to generate vaccination report",
        });
    }
};

// Generate and return a drive summary report
export const generateDriveSummaryReport = async (
    req: Request,
    res: Response
) => {
    try {
        console.log(
            `[${new Date().toISOString()}] Starting drive summary report generation...`
        );

        // Get all vaccination drives with their vaccination counts
        const drives = await VaccinationDrive.findAll({
            include: [
                {
                    model: Vaccination,
                    attributes: ["id"],
                },
            ],
            order: [["date", "DESC"]],
        });

        // Convert to plain objects
        const drivesData = drives.map((drive) => {
            const plainDrive = drive.get({ plain: true });
            return {
                ...plainDrive,
                vaccinationCount: plainDrive.Vaccinations?.length || 0,
            };
        });

        // Create Excel workbook
        const wb = XLSX.utils.book_new();

        // Create drives summary sheet
        const drivesSummary = drivesData.map((drive) => ({
            "Drive ID": drive.id,
            "Drive Name": drive.name,
            Date: new Date(drive.date).toISOString().split("T")[0],
            "Available Doses": drive.availableDoses,
            "Doses Administered": drive.vaccinationCount,
            "Doses Remaining": drive.availableDoses - drive.vaccinationCount,
            "Applicable Classes": drive.applicableClasses,
            Status:
                new Date(drive.date) > new Date() ? "Upcoming" : "Completed",
        }));

        const drivesSheet = XLSX.utils.json_to_sheet(drivesSummary);
        XLSX.utils.book_append_sheet(wb, drivesSheet, "Drive Summary");

        // Create statistics sheet
        const totalDrives = drivesData.length;
        const completedDrives = drivesData.filter(
            (drive) => new Date(drive.date) <= new Date()
        ).length;
        const upcomingDrives = totalDrives - completedDrives;
        const totalDosesAdministered = drivesData.reduce(
            (sum, drive) => sum + drive.vaccinationCount,
            0
        );
        const totalDosesAvailable = drivesData.reduce(
            (sum, drive) => sum + drive.availableDoses,
            0
        );

        const statisticsData = [
            {
                Metric: "Report Generation Date",
                Value: new Date().toLocaleString(),
            },
            { Metric: "Total Drives", Value: totalDrives },
            { Metric: "Completed Drives", Value: completedDrives },
            { Metric: "Upcoming Drives", Value: upcomingDrives },
            {
                Metric: "Total Doses Administered",
                Value: totalDosesAdministered,
            },
            { Metric: "Total Doses Available", Value: totalDosesAvailable },
            {
                Metric: "Utilization Rate",
                Value: `${Math.round(
                    (totalDosesAdministered / totalDosesAvailable) * 100
                )}%`,
            },
        ];

        const statisticsSheet = XLSX.utils.json_to_sheet(statisticsData);
        XLSX.utils.book_append_sheet(wb, statisticsSheet, "Statistics");

        // Generate and send file
        const reportFileName = `Drive_Summary_Report_${new Date()
            .toISOString()
            .replace(/[:.]/g, "-")}.xlsx`;
        const reportPath = path.join(
            __dirname,
            "../../reports",
            reportFileName
        );

        XLSX.writeFile(wb, reportPath);

        res.download(reportPath, reportFileName, (err) => {
            if (err) {
                console.error(
                    `[${new Date().toISOString()}] Error sending report:`,
                    err
                );
            }
            fs.unlink(reportPath, (unlinkErr) => {
                if (unlinkErr) {
                    console.error(
                        `[${new Date().toISOString()}] Error removing temporary report file:`,
                        unlinkErr
                    );
                }
            });
        });
    } catch (error) {
        console.error(
            `[${new Date().toISOString()}] ERROR in generateDriveSummaryReport:`,
            error
        );
        res.status(500).json({
            message: "Failed to generate drive summary report",
        });
    }
};

// Generate and return a class-wise vaccination report
export const generateClassWiseReport = async (req: Request, res: Response) => {
    try {
        console.log(
            `[${new Date().toISOString()}] Starting class-wise report generation...`
        );

        // Get all classes
        const classes = await Student.findAll({
            attributes: ["class"],
            group: ["class"],
            raw: true,
        });

        // Get vaccination data for each class
        const classData = await Promise.all(
            classes.map(async (classItem) => {
                const className = classItem.class;
                const studentsInClass = await Student.count({
                    where: { class: className },
                });
                const vaccinatedStudentsInClass = await Vaccination.count({
                    distinct: true,
                    col: "studentId",
                    include: [
                        {
                            model: Student,
                            where: { class: className },
                            attributes: [],
                        },
                    ],
                });

                return {
                    class: className,
                    totalStudents: studentsInClass,
                    vaccinatedStudents: vaccinatedStudentsInClass,
                    vaccinationRate:
                        studentsInClass > 0
                            ? Math.round(
                                  (vaccinatedStudentsInClass /
                                      studentsInClass) *
                                      100
                              )
                            : 0,
                };
            })
        );

        // Create Excel workbook
        const wb = XLSX.utils.book_new();

        // Create class-wise summary sheet
        const classSummary = classData.map((data) => ({
            Class: data.class,
            "Total Students": data.totalStudents,
            "Vaccinated Students": data.vaccinatedStudents,
            "Vaccination Rate": `${data.vaccinationRate}%`,
        }));

        const classSheet = XLSX.utils.json_to_sheet(classSummary);
        XLSX.utils.book_append_sheet(wb, classSheet, "Class Summary");

        // Create statistics sheet
        const totalStudents = classData.reduce(
            (sum, data) => sum + data.totalStudents,
            0
        );
        const totalVaccinated = classData.reduce(
            (sum, data) => sum + data.vaccinatedStudents,
            0
        );
        const overallVaccinationRate =
            totalStudents > 0
                ? Math.round((totalVaccinated / totalStudents) * 100)
                : 0;

        const statisticsData = [
            {
                Metric: "Report Generation Date",
                Value: new Date().toLocaleString(),
            },
            { Metric: "Total Classes", Value: classes.length },
            { Metric: "Total Students", Value: totalStudents },
            { Metric: "Total Vaccinated Students", Value: totalVaccinated },
            {
                Metric: "Overall Vaccination Rate",
                Value: `${overallVaccinationRate}%`,
            },
        ];

        const statisticsSheet = XLSX.utils.json_to_sheet(statisticsData);
        XLSX.utils.book_append_sheet(wb, statisticsSheet, "Statistics");

        // Generate and send file
        const reportFileName = `Class_Wise_Report_${new Date()
            .toISOString()
            .replace(/[:.]/g, "-")}.xlsx`;
        const reportPath = path.join(
            __dirname,
            "../../reports",
            reportFileName
        );

        XLSX.writeFile(wb, reportPath);

        res.download(reportPath, reportFileName, (err) => {
            if (err) {
                console.error(
                    `[${new Date().toISOString()}] Error sending report:`,
                    err
                );
            }
            fs.unlink(reportPath, (unlinkErr) => {
                if (unlinkErr) {
                    console.error(
                        `[${new Date().toISOString()}] Error removing temporary report file:`,
                        unlinkErr
                    );
                }
            });
        });
    } catch (error) {
        console.error(
            `[${new Date().toISOString()}] ERROR in generateClassWiseReport:`,
            error
        );
        res.status(500).json({
            message: "Failed to generate class-wise report",
        });
    }
};

// Generate and return a report of unvaccinated students
export const generateUnvaccinatedReport = async (
    req: Request,
    res: Response
) => {
    try {
        console.log(
            `[${new Date().toISOString()}] Starting unvaccinated students report generation...`
        );

        // Get all students
        const allStudents = await Student.findAll({ raw: true });
        // Get all vaccinated student IDs
        const vaccinatedStudentIds = (
            await Vaccination.findAll({ attributes: ["studentId"], raw: true })
        ).map((v) => v.studentId);
        // Filter unvaccinated students
        const unvaccinatedStudents = allStudents.filter(
            (student) => !vaccinatedStudentIds.includes(student.id)
        );

        // Class-wise summary
        const classSummary: Record<string, number> = {};
        unvaccinatedStudents.forEach((student) => {
            classSummary[student.class] =
                (classSummary[student.class] || 0) + 1;
        });

        // Create Excel workbook
        const XLSX = require("xlsx");
        const wb = XLSX.utils.book_new();

        // Unvaccinated students sheet
        const studentsSheet = XLSX.utils.json_to_sheet(
            unvaccinatedStudents.map((s) => ({
                "Student ID": s.studentId,
                "Student Name": s.name,
                Class: s.class,
            }))
        );
        XLSX.utils.book_append_sheet(
            wb,
            studentsSheet,
            "Unvaccinated Students"
        );

        // Class summary sheet
        const classSummarySheet = XLSX.utils.json_to_sheet(
            Object.entries(classSummary).map(([className, count]) => ({
                Class: className,
                "Unvaccinated Students": count,
            }))
        );
        XLSX.utils.book_append_sheet(wb, classSummarySheet, "Class Summary");

        // Statistics sheet
        const statisticsSheet = XLSX.utils.json_to_sheet([
            {
                Metric: "Report Generation Date",
                Value: new Date().toLocaleString(),
            },
            { Metric: "Total Students", Value: allStudents.length },
            {
                Metric: "Unvaccinated Students",
                Value: unvaccinatedStudents.length,
            },
        ]);
        XLSX.utils.book_append_sheet(wb, statisticsSheet, "Statistics");

        // Write and send file
        const path = require("path");
        const fs = require("fs");
        const reportFileName = `Unvaccinated_Students_Report_${new Date()
            .toISOString()
            .replace(/[:.]/g, "-")}.xlsx`;
        const reportPath = path.join(
            __dirname,
            "../../reports",
            reportFileName
        );
        XLSX.writeFile(wb, reportPath);
        res.download(reportPath, reportFileName, (err) => {
            if (err) {
                console.error(
                    `[${new Date().toISOString()}] Error sending report:`,
                    err
                );
            }
            fs.unlink(reportPath, (unlinkErr) => {
                if (unlinkErr) {
                    console.error(
                        `[${new Date().toISOString()}] Error removing temporary report file:`,
                        unlinkErr
                    );
                }
            });
        });
    } catch (error) {
        console.error(
            `[${new Date().toISOString()}] ERROR in generateUnvaccinatedReport:`,
            error
        );
        res.status(500).json({
            message: "Failed to generate unvaccinated students report",
        });
    }
};
