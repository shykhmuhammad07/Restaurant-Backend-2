import User from "../Model/AuthSchema.js";
import Booking from "../Model/bookingModel.js";
import Review from "../Model/reviewModel.js";
import Restaurant from "../Model/restaurantModel.js";

// @desc    Get all users
// @route   GET /api/admin/users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort("-createdAt");

    // Get stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const [bookings, reviews] = await Promise.all([
          Booking.countDocuments({ user: user._id }),
          Review.countDocuments({ user: user._id }),
        ]);

        return {
          ...user.toObject(),
          stats: {
            totalBookings: bookings,
            totalReviews: reviews,
          },
        };
      }),
    );

    res.json(usersWithStats);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const [bookings, reviews] = await Promise.all([
      Booking.find({ user: user._id })
        .populate("restaurant", "name")
        .sort("-createdAt")
        .limit(10),
      Review.find({ user: user._id })
        .populate("restaurant", "name")
        .sort("-createdAt")
        .limit(10),
    ]);

    res.json({
      user,
      recentBookings: bookings,
      recentReviews: reviews,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
export const updateUser = async (req, res) => {
  try {
    const { username, email, role, status } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if email is taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    user.username = username || user.username;
    user.email = email || user.email;
    user.role = role || user.role;
    user.status = status || user.status;

    await user.save();

    res.json({
      message: "User updated successfully",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Don't allow deleting yourself
    if (user._id.toString() === req.user.id) {
      return res
        .status(400)
        .json({ message: "Cannot delete your own account" });
    }

    // Delete all user data
    await Promise.all([
      Booking.deleteMany({ user: user._id }),
      Review.deleteMany({ user: user._id }),
      user.deleteOne(),
    ]);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all bookings (admin)
// @route   GET /api/admin/bookings
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "username email")
      .populate("restaurant", "name")
      .populate("table", "tableNumber seats")
      .sort("-createdAt");

    res.json(bookings);
  } catch (error) {
    console.error("Get all bookings error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update booking status (admin)
// @route   PUT /api/admin/bookings/:id
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = status;
    await booking.save();

    res.json({
      message: "Booking status updated",
      booking,
    });
  } catch (error) {
    console.error("Update booking error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
export const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalRestaurants, totalBookings, totalReviews] =
      await Promise.all([
        User.countDocuments(),
        Restaurant.countDocuments(),
        Booking.countDocuments(),
        Review.countDocuments(),
      ]);

    // Get recent activity
    const recentBookings = await Booking.find()
      .populate("user", "username")
      .populate("restaurant", "name")
      .sort("-createdAt")
      .limit(5);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayBookings = await Booking.countDocuments({
      createdAt: { $gte: today },
    });

    res.json({
      stats: {
        totalUsers,
        totalRestaurants,
        totalBookings,
        totalReviews,
        todayBookings,
      },
      recentActivity: recentBookings,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
