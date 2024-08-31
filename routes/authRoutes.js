import { Router } from "express";
import { createUser, loginUser, logoutUser } from "../controllers/authController.js";

const authRoutes = Router();

authRoutes.post("/register", createUser);
authRoutes.post("/login", loginUser);
authRoutes.post("/logout", logoutUser);

export default authRoutes;
