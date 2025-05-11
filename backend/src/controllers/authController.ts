import bcrypt from "bcrypt";
import dotenv from "dotenv";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models";

dotenv.config();

const JWT_SECRET =
    process.env.JWT_SECRET || "school_vaccination_portal_secret_key";

// Admin user creation function
export const createInitialAdmin = async () => {
    try {
        // Check if admin already exists
        const adminExists = await User.findOne({
            where: { username: "admin" },
        });

        if (!adminExists) {
            // Create admin user with strong password
            const adminUser = await User.create({
                username: "admin",
                password: "password123", // Will be hashed by model hooks
                role: "admin",
            });

            // Verify the user was created with a valid password
            if (adminUser && adminUser.password) {
                console.log("Admin user created successfully");
            } else {
                console.error(
                    "Failed to create admin user with valid password"
                );
            }
        } else {
            console.log("Admin user already exists");
        }
    } catch (error) {
        console.error("Error creating admin user:", error);
    }
};

export const login = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
        return res
            .status(400)
            .json({ message: "Username and password are required" });
    }

    try {
        // Find user by username
        const user = await User.findOne({
            where: { username },
            raw: true, // Get raw data to avoid any Sequelize instance issues
        });

        if (!user) {
            return res
                .status(401)
                .json({ message: "Invalid username or password" });
        }

        // Validate password directly with bcrypt
        let isValidPassword = false;
        try {
            isValidPassword = await bcrypt.compare(password, user.password);
        } catch (error) {
            console.error("Password validation error:", error);
        }

        if (!isValidPassword) {
            return res
                .status(401)
                .json({ message: "Invalid username or password" });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                role: user.role,
            },
            JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error during login" });
    }
};
