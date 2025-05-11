import express from "express";
import {
    createUser,
    deleteUser,
    getUserById,
    getUsers,
    updateUser,
} from "../controllers/userController";
import { authenticateToken, authorizeRole } from "../middlewares/auth";

const router = express.Router();

// All routes are admin-only
router.get(
    "/",
    authenticateToken as any,
    authorizeRole(["admin"]) as any,
    getUsers as any
);
router.get(
    "/:id",
    authenticateToken as any,
    authorizeRole(["admin"]) as any,
    getUserById as any
);
router.post(
    "/",
    authenticateToken as any,
    authorizeRole(["admin"]) as any,
    createUser as any
);
router.put(
    "/:id",
    authenticateToken as any,
    authorizeRole(["admin"]) as any,
    updateUser as any
);
router.delete(
    "/:id",
    authenticateToken as any,
    authorizeRole(["admin"]) as any,
    deleteUser as any
);

export default router;
