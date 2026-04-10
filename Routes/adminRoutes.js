import express from "express";
import protect from "../MiddleWare/authMiddleware.js";
import { adminMiddleware } from "../MiddleWare/adminMiddleware.js";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllBookings,
  updateBookingStatus,
  getDashboardStats
} from "../Controllers/AdminController.js";

const router = express.Router();

// All routes require admin authentication
router.use(protect, adminMiddleware);

// User management
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// Booking management
router.get("/bookings", getAllBookings);
router.put("/bookings/:id", updateBookingStatus);

// Dashboard stats
router.get("/stats", getDashboardStats);

export default router;