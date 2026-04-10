import Booking from "../Model/bookingModel.js";
import Table from "../Model/tableModel.js";

// @desc    Check table availability
// @route   POST /api/bookings/:restaurantId/check-availability
export const checkAvailability = async (req, res) => {
  try {
    const { date, time } = req.body;
    const { restaurantId } = req.params;

    // Get all tables for restaurant
    const tables = await Table.find({ restaurant: restaurantId });

    // Get booked tables for given date and time
    const bookedTables = await Booking.find({
      restaurant: restaurantId,
      date,
      time,
      status: "booked",
    }).distinct("table");

    // Filter available tables
    const availableTables = tables.filter(
      (table) => !bookedTables.includes(table._id.toString()),
    );

    res.json(availableTables);
  } catch (error) {
    console.error("Check availability error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Book a table
// @route   POST /api/bookings/:restaurantId/book
export const bookTable = async (req, res) => {
  try {
    const { tableId, date, time, guests, specialRequests, contactNumber } =
      req.body;
    const { restaurantId } = req.params;

    // Check if already booked
    const existingBooking = await Booking.findOne({
      table: tableId,
      date,
      time,
      status: "booked",
    });

    if (existingBooking) {
      return res
        .status(400)
        .json({ message: "Table already booked for this time" });
    }

    // Create booking
    const booking = await Booking.create({
      user: req.user.id,
      restaurant: restaurantId,
      table: tableId,
      date,
      time,
      guests,
      specialRequests,
      contactNumber,
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate("restaurant", "name address")
      .populate("table", "tableNumber seats");

    res.status(201).json({
      message: "Table booked successfully",
      booking: populatedBooking,
    });
  } catch (error) {
    console.error("Book table error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get user's bookings
// @route   GET /api/bookings/my-bookings
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("restaurant", "name address images")
      .populate("table", "tableNumber seats")
      .sort("-createdAt");

    res.json(bookings);
  } catch (error) {
    console.error("Get my bookings error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check ownership
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    booking.status = "cancelled";
    await booking.save();

    res.json({ message: "Booking cancelled successfully" });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
