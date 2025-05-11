import type { Request, Response } from "express";
import { Op } from "sequelize";
import { Student, Vaccination, VaccinationDrive } from "../models";

// Get vaccinations with pagination and filtering
export const getVaccinations = async (req: Request, res: Response) => {
    try {
        const { studentId, driveId, vaccineName, sortField, sortDirection } =
            req.query;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = (page - 1) * limit;

        let whereCondition: any = {};
        let includeConditions: any[] = [
            {
                model: Student,
                attributes: ["id", "name", "studentId", "class"],
            },
            {
                model: VaccinationDrive,
                attributes: ["id", "name", "date", "availableDoses"],
            },
        ];

        if (studentId) {
            includeConditions[0].where = {
                studentId: { [Op.like]: `%${studentId}%` },
            };
        }

        if (driveId) {
            whereCondition.driveId = driveId;
        }

        if (vaccineName) {
            includeConditions[1].where = {
                name: { [Op.like]: `%${vaccineName}%` },
            };
        }

        // Map sortField to the correct column
        let order: any[] = [];
        let direction =
            typeof sortDirection === "string" &&
            sortDirection.toUpperCase() === "ASC"
                ? "ASC"
                : "DESC";
        switch (sortField) {
            case "studentId":
                order = [
                    [{ model: Student, as: "Student" }, "studentId", direction],
                ];
                break;
            case "studentName":
                order = [
                    [{ model: Student, as: "Student" }, "name", direction],
                ];
                break;
            case "class":
                order = [
                    [{ model: Student, as: "Student" }, "class", direction],
                ];
                break;
            case "vaccineName":
                order = [
                    [
                        { model: VaccinationDrive, as: "VaccinationDrive" },
                        "name",
                        direction,
                    ],
                ];
                break;
            case "date":
            case "vaccinationDate":
                order = [["vaccinationDate", direction]];
                break;
            default:
                order = [["vaccinationDate", direction]];
        }

        const { count, rows } = await Vaccination.findAndCountAll({
            where: whereCondition,
            include: includeConditions,
            limit,
            offset,
            order,
        });

        res.json({
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            vaccinations: rows,
        });
    } catch (error) {
        console.error(
            `[${new Date().toISOString()}] ERROR in getVaccinations:`
        );
        console.error(
            `[${new Date().toISOString()}] Query params:`,
            JSON.stringify(req.query)
        );
        console.error(`[${new Date().toISOString()}] Error details:`, error);
        res.status(500).json({ message: "Failed to get vaccinations" });
    }
};

// Get a vaccination by ID
export const getVaccinationById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const vaccination = await Vaccination.findByPk(id, {
            include: [
                {
                    model: Student,
                    attributes: ["id", "name", "studentId", "class"],
                },
                {
                    model: VaccinationDrive,
                    attributes: ["id", "name", "date", "availableDoses"],
                },
            ],
        });

        if (!vaccination) {
            return res
                .status(404)
                .json({ message: "Vaccination record not found" });
        }

        res.json(vaccination);
    } catch (error) {
        console.error(
            `[${new Date().toISOString()}] ERROR in getVaccinationById:`
        );
        console.error(
            `[${new Date().toISOString()}] Params:`,
            JSON.stringify(req.params)
        );
        console.error(`[${new Date().toISOString()}] Error details:`, error);
        res.status(500).json({ message: "Failed to get vaccination" });
    }
};

// Record a new vaccination
export const createVaccination = async (req: Request, res: Response) => {
    try {
        const { studentId, driveId, vaccinationDate } = req.body;

        // Validate input
        if (!studentId || !driveId) {
            console.warn(
                `[${new Date().toISOString()}] VALIDATION ERROR in createVaccination: Missing required fields`
            );
            console.warn(
                `[${new Date().toISOString()}] Request body:`,
                JSON.stringify(req.body)
            );
            return res
                .status(400)
                .json({ message: "Student ID and Drive ID are required" });
        }

        // Check if student exists
        const student = await Student.findByPk(studentId);
        if (!student) {
            console.warn(
                `[${new Date().toISOString()}] NOT FOUND in createVaccination: Student with ID ${studentId} not found`
            );
            return res.status(404).json({ message: "Student not found" });
        }

        // Check if drive exists and load its data
        const drive = await VaccinationDrive.findByPk(driveId);
        if (!drive) {
            console.warn(
                `[${new Date().toISOString()}] NOT FOUND in createVaccination: Drive with ID ${driveId} not found`
            );
            return res
                .status(404)
                .json({ message: "Vaccination drive not found" });
        }

        // Access data using the official Sequelize get() method
        console.log("Drive", drive.toJSON());
        console.log("Available Doses", drive.get("availableDoses"));

        // Log the entire drive object for debugging
        console.log(
            `[${new Date().toISOString()}] DEBUG in createVaccination: Drive object:`,
            JSON.stringify(drive.toJSON())
        );

        // Check if drive date is in the past
        const driveDate = new Date(drive.get("date"));
        const today = new Date();
        if (driveDate > today) {
            console.warn(
                `[${new Date().toISOString()}] VALIDATION ERROR in createVaccination: Drive date is in the future`
            );
            console.warn(
                `[${new Date().toISOString()}] Drive ID: ${driveId}, Drive date: ${driveDate.toISOString()}`
            );
            return res.status(400).json({
                message: "Cannot record vaccinations for future drives",
            });
        }

        // Validate vaccination date
        const parsedVaccinationDate = new Date(vaccinationDate);
        if (parsedVaccinationDate < driveDate) {
            console.warn(
                `[${new Date().toISOString()}] VALIDATION ERROR in createVaccination: Vaccination date is before drive date`
            );
            console.warn(
                `[${new Date().toISOString()}] Drive ID: ${driveId}, Drive date: ${driveDate.toISOString()}, Vaccination date: ${parsedVaccinationDate.toISOString()}`
            );
            return res.status(400).json({
                message:
                    "Vaccination date cannot be before the drive's start date",
            });
        }

        if (parsedVaccinationDate > today) {
            console.warn(
                `[${new Date().toISOString()}] VALIDATION ERROR in createVaccination: Vaccination date is in the future`
            );
            console.warn(
                `[${new Date().toISOString()}] Drive ID: ${driveId}, Vaccination date: ${parsedVaccinationDate.toISOString()}`
            );
            return res.status(400).json({
                message: "Vaccination date cannot be in the future",
            });
        }

        // Ensure availableDoses is a valid number
        const availableDoses = drive.get("availableDoses");
        if (availableDoses === undefined || availableDoses === null) {
            console.warn(
                `[${new Date().toISOString()}] VALIDATION ERROR in createVaccination: Available doses is undefined or null`
            );
            console.warn(
                `[${new Date().toISOString()}] Drive ID: ${driveId}, Available doses raw value:`,
                availableDoses
            );
            return res.status(400).json({
                message:
                    "Invalid vaccination drive: available doses not properly configured",
            });
        }

        const parsedDoses = parseInt(String(availableDoses), 10);
        console.log(
            `[${new Date().toISOString()}] DEBUG in createVaccination: Parsed available doses:`,
            parsedDoses,
            "from raw value:",
            availableDoses
        );

        if (isNaN(parsedDoses) || parsedDoses <= 0) {
            console.warn(
                `[${new Date().toISOString()}] VALIDATION ERROR in createVaccination: No doses available`
            );
            console.warn(
                `[${new Date().toISOString()}] Drive ID: ${driveId}, Available doses: ${availableDoses}, Parsed value: ${parsedDoses}`
            );
            return res.status(400).json({
                message: "No doses available for this vaccination drive",
            });
        }

        // Check if student's class is eligible for this vaccination drive
        const applicableClasses = String(drive.get("applicableClasses") || "")
            .split(",")
            .map((c) => c.trim());
        if (applicableClasses.length === 0 || applicableClasses[0] === "") {
            console.warn(
                `[${new Date().toISOString()}] VALIDATION ERROR in createVaccination: No applicable classes defined`
            );
            console.warn(
                `[${new Date().toISOString()}] Drive ID: ${driveId}, Applicable classes: ${drive.get(
                    "applicableClasses"
                )}`
            );
            return res.status(400).json({
                message:
                    "This vaccination drive has no applicable classes defined",
            });
        }

        if (!applicableClasses.includes(student.get("class"))) {
            console.warn(
                `[${new Date().toISOString()}] VALIDATION ERROR in createVaccination: Student class not eligible`
            );
            console.warn(
                `[${new Date().toISOString()}] Student ID: ${studentId}, Class: ${student.get(
                    "class"
                )}, Eligible classes: ${applicableClasses.join(", ")}`
            );
            return res.status(400).json({
                message: `This student (Class ${student.get(
                    "class"
                )}) is not eligible for this vaccination drive. Eligible classes: ${applicableClasses.join(
                    ", "
                )}`,
            });
        }

        // Check if vaccination record already exists
        const existingVaccination = await Vaccination.findOne({
            where: {
                studentId,
                driveId,
            },
        });

        if (existingVaccination) {
            console.warn(
                `[${new Date().toISOString()}] DUPLICATE ERROR in createVaccination: Vaccination record already exists`
            );
            console.warn(
                `[${new Date().toISOString()}] Student ID: ${studentId}, Drive ID: ${driveId}`
            );
            return res.status(400).json({
                message:
                    "This student has already been vaccinated in this drive",
            });
        }

        // Create the vaccination record
        const vaccination = await Vaccination.create({
            studentId,
            driveId,
            vaccinationDate: vaccinationDate || new Date(),
        });

        // Update available doses in the drive (decrement by 1)
        const newDoses = Math.max(0, parsedDoses - 1);
        await VaccinationDrive.update(
            { availableDoses: newDoses },
            { where: { id: driveId } }
        );

        console.log(
            `[${new Date().toISOString()}] SUCCESS in createVaccination: Created new vaccination record`
        );
        console.log(
            `[${new Date().toISOString()}] Vaccination ID: ${
                vaccination.id
            }, Student ID: ${studentId}, Drive ID: ${driveId}`
        );

        res.status(201).json(vaccination);
    } catch (error) {
        console.error(
            `[${new Date().toISOString()}] ERROR in createVaccination:`
        );
        console.error(
            `[${new Date().toISOString()}] Request body:`,
            JSON.stringify(req.body)
        );
        console.error(`[${new Date().toISOString()}] Error details:`, error);
        res.status(500).json({
            message: "Failed to create vaccination record",
        });
    }
};

// Delete a vaccination record
export const deleteVaccination = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const vaccination = await Vaccination.findByPk(id);
        if (!vaccination) {
            return res
                .status(404)
                .json({ message: "Vaccination record not found" });
        }

        // Get the drive to restore dose count
        const drive = await VaccinationDrive.findByPk(vaccination.driveId);

        // Delete the vaccination record
        await vaccination.destroy();

        if (drive) {
            // Ensure availableDoses is a valid number
            const currentDoses = parseInt(
                String(drive.get("availableDoses")),
                10
            );
            const newDoses = isNaN(currentDoses) ? 1 : currentDoses + 1;

            // Update the drive with incremented doses
            await VaccinationDrive.update(
                { availableDoses: newDoses },
                { where: { id: vaccination.driveId } }
            );
        }

        res.json({ message: "Vaccination record deleted successfully" });
    } catch (error) {
        console.error(
            `[${new Date().toISOString()}] ERROR in deleteVaccination:`
        );
        console.error(
            `[${new Date().toISOString()}] Params:`,
            JSON.stringify(req.params)
        );
        console.error(`[${new Date().toISOString()}] Error details:`, error);
        res.status(500).json({ message: "Failed to delete vaccination" });
    }
};

// Get vaccination statistics for dashboard
export const getVaccinationStatistics = async (req: Request, res: Response) => {
    try {
        // Get total students
        const totalStudents = await Student.count();

        // Get total vaccinated students (unique)
        const vaccinatedStudentsCount = await Vaccination.count({
            distinct: true,
            col: "studentId",
        });

        // Get all upcoming drives (future dates)
        const today = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);

        const upcomingDrives = await VaccinationDrive.findAll({
            where: {
                date: {
                    [Op.gte]: today,
                },
            },
            order: [["date", "ASC"]],
        });

        // Get completed drives (past dates)
        const completedDrives = await VaccinationDrive.findAll({
            where: {
                date: {
                    [Op.lt]: today,
                },
            },
            order: [["date", "DESC"]],
        });

        // Add a flag for drives within 30 days
        const drivesWithFlags = upcomingDrives.map((drive) => {
            const driveDate = new Date(drive.get("date"));
            const isWithin30Days = driveDate <= thirtyDaysFromNow;

            return {
                ...drive.toJSON(),
                isWithin30Days,
            };
        });

        // Get statistics for completed drives
        const completedDrivesWithStats = await Promise.all(
            completedDrives.map(async (drive) => {
                const driveId = drive.get("id");
                const vaccinationsDone = await Vaccination.count({
                    where: { driveId },
                });

                return {
                    ...drive.toJSON(),
                    totalDoses: drive.get("availableDoses"),
                    vaccinationsDone,
                };
            })
        );

        // Calculate vaccination percentage
        const vaccinationPercentage =
            totalStudents > 0
                ? Math.round((vaccinatedStudentsCount / totalStudents) * 100)
                : 0;

        res.json({
            totalStudents,
            vaccinatedStudents: vaccinatedStudentsCount,
            vaccinationPercentage,
            upcomingDrives: drivesWithFlags.length > 0 ? drivesWithFlags : null,
            completedDrives:
                completedDrivesWithStats.length > 0
                    ? completedDrivesWithStats
                    : null,
        });
    } catch (error) {
        console.error(
            `[${new Date().toISOString()}] ERROR in getVaccinationStatistics:`
        );
        console.error(`[${new Date().toISOString()}] Error details:`, error);
        res.status(500).json({
            message: "Failed to get vaccination statistics",
        });
    }
};

// Get all unique classes for dropdown
export const getClassesDropdown = async (req: Request, res: Response) => {
    try {
        // Ensure sequelize instance exists
        if (!Student.sequelize) {
            throw new Error("Sequelize instance not found on Student model");
        }
        // Find all unique class values from students
        const classes = await Student.findAll({
            attributes: [
                [
                    Student.sequelize.fn(
                        "DISTINCT",
                        Student.sequelize.col("class")
                    ),
                    "class",
                ],
            ],
            raw: true,
        });
        // Map to array of class values
        const classList = classes.map((c: any) => c.class).filter(Boolean);
        res.json({ classes: classList });
    } catch (error) {
        console.error(
            `[${new Date().toISOString()}] ERROR in getClassesDropdown:`,
            error
        );
        res.status(500).json({ message: "Failed to get class list" });
    }
};

// Update a vaccination record
export const updateVaccination = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { studentId, driveId, vaccinationDate } = req.body;

        // Validate input
        if (!studentId || !driveId) {
            console.warn(
                `[${new Date().toISOString()}] VALIDATION ERROR in updateVaccination: Missing required fields`
            );
            console.warn(
                `[${new Date().toISOString()}] Request body:`,
                JSON.stringify(req.body)
            );
            return res
                .status(400)
                .json({ message: "Student ID and Drive ID are required" });
        }

        // Check if vaccination exists
        const vaccination = await Vaccination.findByPk(id);
        if (!vaccination) {
            console.warn(
                `[${new Date().toISOString()}] NOT FOUND in updateVaccination: Vaccination with ID ${id} not found`
            );
            return res.status(404).json({ message: "Vaccination not found" });
        }

        // Check if student exists
        const student = await Student.findByPk(studentId);
        if (!student) {
            console.warn(
                `[${new Date().toISOString()}] NOT FOUND in updateVaccination: Student with ID ${studentId} not found`
            );
            return res.status(404).json({ message: "Student not found" });
        }

        // Check if drive exists and load its data
        const drive = await VaccinationDrive.findByPk(driveId);
        if (!drive) {
            console.warn(
                `[${new Date().toISOString()}] NOT FOUND in updateVaccination: Drive with ID ${driveId} not found`
            );
            return res
                .status(404)
                .json({ message: "Vaccination drive not found" });
        }

        // Check if drive date is in the past
        const driveDate = new Date(drive.get("date"));
        const today = new Date();
        if (driveDate > today) {
            console.warn(
                `[${new Date().toISOString()}] VALIDATION ERROR in updateVaccination: Drive date is in the future`
            );
            return res.status(400).json({
                message: "Cannot record vaccinations for future drives",
            });
        }

        // Validate vaccination date
        const parsedVaccinationDate = new Date(vaccinationDate);
        if (parsedVaccinationDate < driveDate) {
            console.warn(
                `[${new Date().toISOString()}] VALIDATION ERROR in updateVaccination: Vaccination date is before drive date`
            );
            return res.status(400).json({
                message:
                    "Vaccination date cannot be before the drive's start date",
            });
        }

        if (parsedVaccinationDate > today) {
            console.warn(
                `[${new Date().toISOString()}] VALIDATION ERROR in updateVaccination: Vaccination date is in the future`
            );
            return res.status(400).json({
                message: "Vaccination date cannot be in the future",
            });
        }

        // Check if student's class is eligible for this vaccination drive
        const applicableClasses = String(drive.get("applicableClasses") || "")
            .split(",")
            .map((c) => c.trim());
        if (!applicableClasses.includes(student.get("class"))) {
            console.warn(
                `[${new Date().toISOString()}] VALIDATION ERROR in updateVaccination: Student class not eligible`
            );
            return res.status(400).json({
                message: `This student (Class ${student.get(
                    "class"
                )}) is not eligible for this vaccination drive. Eligible classes: ${applicableClasses.join(
                    ", "
                )}`,
            });
        }

        // Check if vaccination record already exists for different ID
        const existingVaccination = await Vaccination.findOne({
            where: {
                studentId,
                driveId,
                id: { [Op.ne]: id }, // Exclude current vaccination
            },
        });

        if (existingVaccination) {
            console.warn(
                `[${new Date().toISOString()}] DUPLICATE ERROR in updateVaccination: Vaccination record already exists`
            );
            return res.status(400).json({
                message:
                    "This student has already been vaccinated in this drive",
            });
        }

        // Update the vaccination record
        await vaccination.update({
            studentId,
            driveId,
            vaccinationDate: parsedVaccinationDate,
        });

        console.log(
            `[${new Date().toISOString()}] SUCCESS in updateVaccination: Updated vaccination record`
        );
        console.log(
            `[${new Date().toISOString()}] Vaccination ID: ${id}, Student ID: ${studentId}, Drive ID: ${driveId}`
        );

        res.json(vaccination);
    } catch (error) {
        console.error(
            `[${new Date().toISOString()}] ERROR in updateVaccination:`
        );
        console.error(
            `[${new Date().toISOString()}] Request body:`,
            JSON.stringify(req.body)
        );
        console.error(`[${new Date().toISOString()}] Error details:`, error);
        res.status(500).json({
            message: "Failed to update vaccination record",
        });
    }
};
