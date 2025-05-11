import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import { initializeDatabase, testConnection } from "./config/database";
// import { createInitialAdmin } from './controllers/authController';
import { errorLogger, requestLogger } from "./middlewares/logging";
import { seedDatabase } from "./seeders";
import seedAdminUser from "./seeders/seedAdmin";

// Import routes
import authRoutes from "./routes/authRoutes";
import reportRoutes from "./routes/reportRoutes";
import studentRoutes from "./routes/studentRoutes";
import userRoutes from "./routes/userRoutes";
import vaccinationDriveRoutes from "./routes/vaccinationDriveRoutes";
import vaccinationRoutes from "./routes/vaccinationRoutes";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add request logging middleware
app.use(requestLogger);

// Setup uploads directory for CSV files
import fs from "fs";
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Test database connection and initialize
(async () => {
    try {
        // Test database connection
        await testConnection();

        // Initialize database (this creates tables if they don't exist)
        await initializeDatabase();

        // Check if admin user already exists before seeding
        const { User } = await import("./models");
        const adminExists = await User.findOne({
            where: { username: "admin" },
        });

        if (!adminExists) {
            console.log("No admin user found, seeding data...");

            // Seed admin user
            await seedAdminUser();

            // Seed the database with sample data
            if (process.env.NODE_ENV !== "production") {
                await seedDatabase();
            }

            console.log("Initial database seeding completed successfully");
        } else {
            console.log(
                "Database already contains data, skipping initial seeding"
            );
        }
    } catch (error) {
        console.error("Error during database setup:", error);
    }
})();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/vaccination-drives", vaccinationDriveRoutes);
app.use("/api/vaccinations", vaccinationRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/users", userRoutes);
// Add error logging middleware after routes
app.use(errorLogger);

// Base route for API health check
app.get("/api", (req, res) => {
    res.json({ message: "School Vaccination Portal API is running" });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
