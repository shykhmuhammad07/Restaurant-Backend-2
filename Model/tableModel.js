import mongoose from "mongoose";

const tableSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    tableNumber: {
      type: Number,
      required: true,
    },

    seats: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

// same restaurant me same table number repeat na ho
tableSchema.index({ restaurant: 1, tableNumber: 1 }, { unique: true });

export default mongoose.model("Table", tableSchema);
