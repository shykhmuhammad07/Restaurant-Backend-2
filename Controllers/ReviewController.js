// Controllers/ReviewController.js
import Review from "../Model/reviewModel.js";
import Restaurant from "../Model/restaurantModel.js";

// Add review
const addReview = async (req, res) => {
  try {
    const { rating, comment, restaurantId } = req.body;

    // Check user
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be 1-5" });
    }

    if (!restaurantId) {
      return res.status(400).json({ message: "Restaurant ID required" });
    }

    // Check restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Check user already reviewed
    const alreadyReviewed = await Review.findOne({
      user: req.user.id,
      restaurant: restaurantId,
    });

    if (alreadyReviewed) {
      return res
        .status(400)
        .json({ message: "You already reviewed this restaurant" });
    }

    // Create review
    const review = await Review.create({
      user: req.user.id,
      restaurant: restaurantId,
      rating,
      comment,
    });

    // Update restaurant rating
    const reviews = await Review.find({ restaurant: restaurantId });

    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await Restaurant.findByIdAndUpdate(restaurantId, {
      rating: avgRating,
    });

    res.status(201).json({
      message: "Review added successfully",
      review,
      rating: avgRating,
    });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user's reviews
const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.id })
      .populate("restaurant", "name address images")
      .sort("-createdAt");

    res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update review
const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check ownership
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    await review.save();

    // Update restaurant average rating
    const reviews = await Review.find({ restaurant: review.restaurant });
    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await Restaurant.findByIdAndUpdate(review.restaurant, {
      rating: avgRating,
    });

    res.json(review);
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete review
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check ownership
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await review.deleteOne();

    // Update restaurant average rating
    const reviews = await Review.find({ restaurant: review.restaurant });
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    await Restaurant.findByIdAndUpdate(review.restaurant, {
      rating: avgRating,
    });

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export { addReview, getMyReviews, updateReview, deleteReview };
