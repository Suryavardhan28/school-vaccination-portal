import type { Request, Response } from "express";
import { Op } from "sequelize";
import { VaccinationDrive } from "../models";

// Get all vaccination drives or filter by upcoming
export const getVaccinationDrives = async (req: Request, res: Response) => {
    try {
        const {
            upcoming,
            name,
            class: classFilter,
            status,
            sortField = "date",
            sortDirection = "ASC",
        } = req.query;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = (page - 1) * limit;

        let whereCondition: any = {};

        // Filter for upcoming drives (within the next 30 days)
        if (upcoming === "true") {
            const today = new Date();
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(today.getDate() + 30);

            whereCondition.date = {
                [Op.gte]: today,
                [Op.lte]: thirtyDaysFromNow,
            };
        }

        // Filter by name
        if (name) {
            whereCondition.name = {
                [Op.like]: `%${name}%`,
            };
        }

        // Filter by class
        if (classFilter) {
            whereCondition.applicableClasses = {
                [Op.like]: `%${classFilter}%`,
            };
        }

        // Filter by status
        if (status) {
            const today = new Date();
            if (status === "past") {
                whereCondition.date = {
                    [Op.lt]: today,
                };
            } else if (status === "upcoming") {
                whereCondition.date = {
                    [Op.gte]: today,
                };
            }
        }

        const { count, rows } = await VaccinationDrive.findAndCountAll({
            where: whereCondition,
            limit,
            offset,
            order: [[sortField as string, sortDirection as string]],
        });

        console.log(
            `[${new Date().toISOString()}] SUCCESS in getVaccinationDrives: Retrieved ${
                rows.length
            } drives`
        );
        console.log(
            `[${new Date().toISOString()}] Page: ${page}, Limit: ${limit}, Total: ${count}`
        );

        res.json({
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            vaccinationDrives: rows,
        });
    } catch (error) {
        console.error(
            `[${new Date().toISOString()}] ERROR in getVaccinationDrives:`
        );
        console.error(
            `[${new Date().toISOString()}] Query params:`,
            JSON.stringify(req.query)
        );
        console.error(`[${new Date().toISOString()}] Error details:`, error);
        res.status(500).json({ message: "Failed to get vaccination drives" });
    }
};

// Get a vaccination drive by ID
export const getVaccinationDriveById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const vaccinationDrive = await VaccinationDrive.findByPk(id);

        if (!vaccinationDrive) {
            console.warn(
                `[${new Date().toISOString()}] NOT FOUND in getVaccinationDriveById: Drive not found`
            );
            console.warn(`[${new Date().toISOString()}] Drive ID: ${id}`);
            return res
                .status(404)
                .json({ message: "Vaccination drive not found" });
        }

        console.log(
            `[${new Date().toISOString()}] SUCCESS in getVaccinationDriveById: Retrieved drive`
        );
        console.log(
            `[${new Date().toISOString()}] Drive ID: ${id}, Name: ${vaccinationDrive.get(
                "name"
            )}`
        );

        res.json(vaccinationDrive);
    } catch (error) {
        console.error(
            `[${new Date().toISOString()}] ERROR in getVaccinationDriveById:`
        );
        console.error(
            `[${new Date().toISOString()}] Params:`,
            JSON.stringify(req.params)
        );
        console.error(`[${new Date().toISOString()}] Error details:`, error);
        res.status(500).json({ message: "Failed to get vaccination drive" });
    }
};

// Create a new vaccination drive
export const createVaccinationDrive = async (req: Request, res: Response) => {
    try {
        const { name, date, availableDoses, applicableClasses } = req.body;

        // Validate required fields
        if (!name || !date || !availableDoses || !applicableClasses) {
            console.warn(
                `[${new Date().toISOString()}] VALIDATION ERROR in createVaccinationDrive: Missing required fields`
            );
            console.warn(
                `[${new Date().toISOString()}] Request body:`,
                JSON.stringify(req.body)
            );
            return res.status(400).json({ message: "All fields are required" });
        }

        // Ensure availableDoses is a number
        const doses = parseInt(availableDoses, 10);
        if (isNaN(doses) || doses <= 0) {
            console.warn(
                `[${new Date().toISOString()}] VALIDATION ERROR in createVaccinationDrive: Invalid doses`
            );
            console.warn(
                `[${new Date().toISOString()}] Available doses:`,
                availableDoses
            );
            return res
                .status(400)
                .json({ message: "Available doses must be a positive number" });
        }

        // Check if the date is at least 15 days from today
        const driveDate = new Date(date);
        const today = new Date();
        const minDate = new Date();
        minDate.setDate(today.getDate() + 15);

        if (driveDate < minDate) {
            console.warn(
                `[${new Date().toISOString()}] VALIDATION ERROR in createVaccinationDrive: Date too soon`
            );
            console.warn(
                `[${new Date().toISOString()}] Drive date:`,
                driveDate.toISOString(),
                "Minimum date:",
                minDate.toISOString()
            );
            return res.status(400).json({
                message:
                    "Vaccination drives must be scheduled at least 15 days in advance",
            });
        }

        // Check for overlapping drives on the same date
        const existingDrive = await VaccinationDrive.findOne({
            where: {
                date: {
                    [Op.eq]: driveDate,
                },
            },
        });

        if (existingDrive) {
            console.warn(
                `[${new Date().toISOString()}] CONFLICT ERROR in createVaccinationDrive: Date conflict`
            );
            console.warn(
                `[${new Date().toISOString()}] Requested date:`,
                driveDate.toISOString(),
                "Conflicting drive ID:",
                existingDrive.id
            );
            return res.status(409).json({
                message:
                    "Another vaccination drive is already scheduled for this date",
            });
        }

        const vaccinationDrive = await VaccinationDrive.create({
            name,
            date: driveDate,
            availableDoses: doses,
            applicableClasses,
        });

        console.log(
            `[${new Date().toISOString()}] SUCCESS in createVaccinationDrive: Drive created`
        );
        console.log(
            `[${new Date().toISOString()}] Drive ID: ${
                vaccinationDrive.id
            }, Name: ${name}, Date: ${driveDate.toISOString()}`
        );

        res.status(201).json(vaccinationDrive);
    } catch (error) {
        console.error(
            `[${new Date().toISOString()}] ERROR in createVaccinationDrive:`
        );
        console.error(
            `[${new Date().toISOString()}] Request body:`,
            JSON.stringify(req.body)
        );
        console.error(`[${new Date().toISOString()}] Error details:`, error);
        res.status(500).json({ message: "Failed to create vaccination drive" });
    }
};

// Update a vaccination drive
export const updateVaccinationDrive = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, date, availableDoses, applicableClasses } = req.body;

        const vaccinationDrive = await VaccinationDrive.findByPk(id);

        if (!vaccinationDrive) {
            console.warn(
                `[${new Date().toISOString()}] NOT FOUND in updateVaccinationDrive: Drive not found`
            );
            console.warn(`[${new Date().toISOString()}] Drive ID: ${id}`);
            return res
                .status(404)
                .json({ message: "Vaccination drive not found" });
        }

        // Check if drive is in the past
        const driveDate = new Date(vaccinationDrive.get("date"));
        const today = new Date();

        if (driveDate < today) {
            console.warn(
                `[${new Date().toISOString()}] VALIDATION ERROR in updateVaccinationDrive: Cannot edit past drive`
            );
            console.warn(
                `[${new Date().toISOString()}] Drive ID: ${id}, Drive date: ${driveDate.toISOString()}`
            );
            return res
                .status(400)
                .json({ message: "Cannot edit past vaccination drives" });
        }

        // If date is changing, validate it's at least 15 days from today and no overlap
        if (date && date !== vaccinationDrive.get("date")) {
            const newDriveDate = new Date(date);
            const minDate = new Date();
            minDate.setDate(today.getDate() + 15);

            if (newDriveDate < minDate) {
                console.warn(
                    `[${new Date().toISOString()}] VALIDATION ERROR in updateVaccinationDrive: New date too soon`
                );
                console.warn(
                    `[${new Date().toISOString()}] Drive ID: ${id}, New date: ${newDriveDate.toISOString()}, Min date: ${minDate.toISOString()}`
                );
                return res.status(400).json({
                    message:
                        "Vaccination drives must be scheduled at least 15 days in advance",
                });
            }

            // Check for overlapping drives on the same date
            const existingDrive = await VaccinationDrive.findOne({
                where: {
                    id: { [Op.ne]: id },
                    date: { [Op.eq]: newDriveDate },
                },
            });

            if (existingDrive) {
                console.warn(
                    `[${new Date().toISOString()}] CONFLICT ERROR in updateVaccinationDrive: Date conflict`
                );
                console.warn(
                    `[${new Date().toISOString()}] Drive ID: ${id}, New date: ${newDriveDate.toISOString()}, Conflicting drive ID: ${
                        existingDrive.id
                    }`
                );
                return res.status(409).json({
                    message:
                        "Another vaccination drive is already scheduled for this date",
                });
            }
        }

        await vaccinationDrive.update({
            name: name || vaccinationDrive.get("name"),
            date: date ? new Date(date) : vaccinationDrive.get("date"),
            availableDoses:
                availableDoses || vaccinationDrive.get("availableDoses"),
            applicableClasses:
                applicableClasses || vaccinationDrive.get("applicableClasses"),
        });

        console.log(
            `[${new Date().toISOString()}] SUCCESS in updateVaccinationDrive: Drive updated`
        );
        console.log(
            `[${new Date().toISOString()}] Drive ID: ${id}, Updated fields:`,
            JSON.stringify({
                name: name || undefined,
                date: date ? new Date(date).toISOString() : undefined,
                availableDoses: availableDoses || undefined,
                applicableClasses: applicableClasses || undefined,
            })
        );

        res.json(vaccinationDrive);
    } catch (error) {
        console.error(
            `[${new Date().toISOString()}] ERROR in updateVaccinationDrive:`
        );
        console.error(
            `[${new Date().toISOString()}] Request params:`,
            JSON.stringify(req.params)
        );
        console.error(
            `[${new Date().toISOString()}] Request body:`,
            JSON.stringify(req.body)
        );
        console.error(`[${new Date().toISOString()}] Error details:`, error);
        res.status(500).json({ message: "Failed to update vaccination drive" });
    }
};

// Delete a vaccination drive
export const deleteVaccinationDrive = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const vaccinationDrive = await VaccinationDrive.findByPk(id);

        if (!vaccinationDrive) {
            console.warn(
                `[${new Date().toISOString()}] NOT FOUND in deleteVaccinationDrive: Drive not found`
            );
            console.warn(`[${new Date().toISOString()}] Drive ID: ${id}`);
            return res
                .status(404)
                .json({ message: "Vaccination drive not found" });
        }

        // Check if drive is in the past
        const driveDate = new Date(vaccinationDrive.get("date"));
        const today = new Date();

        if (driveDate < today) {
            console.warn(
                `[${new Date().toISOString()}] VALIDATION ERROR in deleteVaccinationDrive: Cannot delete past drive`
            );
            console.warn(
                `[${new Date().toISOString()}] Drive ID: ${id}, Drive date: ${driveDate.toISOString()}`
            );
            return res
                .status(400)
                .json({ message: "Cannot delete past vaccination drives" });
        }

        await vaccinationDrive.destroy();

        console.log(
            `[${new Date().toISOString()}] SUCCESS in deleteVaccinationDrive: Drive deleted`
        );
        console.log(
            `[${new Date().toISOString()}] Drive ID: ${id}, Name: ${vaccinationDrive.get(
                "name"
            )}`
        );

        res.json({ message: "Vaccination drive deleted successfully" });
    } catch (error) {
        console.error(
            `[${new Date().toISOString()}] ERROR in deleteVaccinationDrive:`
        );
        console.error(
            `[${new Date().toISOString()}] Params:`,
            JSON.stringify(req.params)
        );
        console.error(`[${new Date().toISOString()}] Error details:`, error);
        res.status(500).json({ message: "Failed to delete vaccination drive" });
    }
};
