import express from "express";
import protect from "../MiddleWare/authMiddleware.js";
import upload from "../MiddleWare/Multer.js";
import { adminMiddleware } from "../MiddleWare/adminMiddleware.js";
import {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
  addTable,
  getRestaurantTables
} from "../Controllers/ResturantController.js";

const router = express.Router();

// Public routes
router.get("/", getAllRestaurants);
router.get("/:id", getRestaurantById);

// Protected routes (user)
router.use(protect);

// Admin only routes
router.post("/create", adminMiddleware, upload.array("images", 5), createRestaurant);
router.put("/:id", adminMiddleware, upload.array("images", 5), updateRestaurant);
router.delete("/:id", adminMiddleware, deleteRestaurant);
router.post("/:restaurantId/tables", adminMiddleware, addTable);
router.get("/:restaurantId/tables", adminMiddleware, getRestaurantTables);

export default router;