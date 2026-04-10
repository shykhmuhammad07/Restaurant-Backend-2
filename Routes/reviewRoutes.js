import express from "express";
import protect from "../MiddleWare/authMiddleware.js";
import {
  addReview,
  getMyReviews,
  updateReview,
  deleteReview
} from "../Controllers/ReviewController.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.get("/my-reviews", getMyReviews);
router.post("/:restaurantId/addReview", addReview);
router.put("/:id", updateReview);
router.delete("/:id", deleteReview);

export default router;