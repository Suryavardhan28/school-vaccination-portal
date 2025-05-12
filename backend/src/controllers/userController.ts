import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { Op, UniqueConstraintError } from "sequelize";
import User from "../models/User";

// Get all users with filtering and pagination
export const getUsers = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = (page - 1) * limit;
        const username = req.query.username as string;
        const role = req.query.role as string;
        const sortField = (req.query.sortField as string) || "username";
        const sortDirection = (req.query.sortDirection as string) || "asc";
        const userId = req.query.userId as string;

        // Build where clause for filtering
        const where: any = {};
        if (username && typeof username === "string") {
            where.username = {
                [Op.like]: `%${username.toLowerCase()}%`,
            };
        }
        if (role && role !== "all") {
            where.role = role;
        }
        if (userId && typeof userId === "string") {
            where.id = userId;
        }

        // Get total count for pagination
        const total = await User.count({ where });

        // Get users with filtering, sorting, and pagination
        const users = await User.findAll({
            where,
            attributes: { exclude: ["password"] },
            order: [[sortField, sortDirection.toUpperCase()]],
            limit,
            offset,
        });

        res.json({
            users,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({
            message: "Failed to fetch users",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

// Get a single user
export const getUserById = async (req: Request, res: Response) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ["password"] },
        });
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch user" });
    }
};

// Create a new user
export const createUser = async (req: Request, res: Response) => {
    try {
        const { username, password, role } = req.body;
        if (!username || !password || !role) {
            return res
                .status(400)
                .json({ message: "Username, password, and role are required" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await User.create({
            username,
            password: hashedPassword,
            role,
        });
        res.status(201).json({
            id: user.id,
            username: user.username,
            role: user.role,
        });
    } catch (error) {
        if (error instanceof UniqueConstraintError) {
            return res.status(400).json({ message: "Username already exists" });
        }
        res.status(500).json({ message: "Failed to create user" });
    }
};

// Update a user
export const updateUser = async (req: Request, res: Response) => {
    try {
        const { username, role } = req.body;
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const updates: any = {};
        if (username && username !== user.username) {
            updates.username = username;
        }

        if (typeof role !== "undefined") {
            updates.role = role;
        }
        if (Object.keys(updates).length > 0) {
            await user.update(updates);
        }

        res.json({ id: user.id, username: user.username, role: user.role });
    } catch (error) {
        if (error instanceof UniqueConstraintError) {
            return res.status(400).json({ message: "Username already exists" });
        }
        res.status(500).json({ message: "Failed to update user" });
    }
};

// Delete a user
export const deleteUser = async (req: Request, res: Response) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        await user.destroy();
        res.json({ message: "User deleted" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete user" });
    }
};
