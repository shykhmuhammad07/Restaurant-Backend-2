import express from "express";
import {
  signUp,
  login,
  logout,
  getMe
} from "../Controllers/AuthController.js";
import protect from "../MiddleWare/authMiddleware.js";

const router = express.Router();

router.post("/signup", signUp);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protect, getMe);

export default router;