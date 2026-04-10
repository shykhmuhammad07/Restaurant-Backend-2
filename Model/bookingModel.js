import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      required: true,
    },

    date: {
      type: String, // "2026-01-20"
      required: true,
    },

    time: {
      type: String, // "7:00 PM - 9:00 PM"
      required: true,
    },

    status: {
      type: String,
      default: "booked",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
