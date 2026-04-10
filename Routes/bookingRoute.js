import express from "express";
import protect from "../MiddleWare/authMiddleware.js";
import {
  checkAvailability,
  bookTable,
  getMyBookings,
  cancelBooking
} from "../Controllers/BookingController.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.get("/my-bookings", getMyBookings);
router.post("/:restaurantId/check-availability", checkAvailability);
router.post("/:restaurantId/book", bookTable);
router.put("/:id/cancel", cancelBooking);

export default router;