import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./Config/db.js";

// Import Routes
import authRoute from "./Routes/authRoute.js";
import restaurantRoute from "./Routes/restaurantRoute.js";
import bookingRoute from "./Routes/bookingRoute.js";
import reviewRoute from "./Routes/reviewRoutes.js";
import adminRoute from "./Routes/adminRoutes.js";

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
  ],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.get("/", (req, res) => {
  res.send("Project is live");
});
app.use("/api/auth", authRoute);
app.use("/api/restaurants", restaurantRoute);
app.use("/api/bookings", bookingRoute);
app.use("/api/reviews", reviewRoute);
app.use("/api/admin", adminRoute);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});
