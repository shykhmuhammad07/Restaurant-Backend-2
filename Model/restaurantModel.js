import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,

    address: String,

    location: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
    },

    images: [String],

    rating: {
      type: Number,
      default: 0,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // admin
    },
  },
  { timestamps: true },
);

export default mongoose.model("Restaurant", restaurantSchema);
