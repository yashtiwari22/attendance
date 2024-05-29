import { Router } from "express";
import {
  login,
  logout,
  logoutFromEverywhere,
} from "../controller/authController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const authRouter = Router();

/* ------------------------------- Login Route ------------------------------ */

authRouter.post("/login", login);

/* ------------------------------ Logout Routes ----------------------------- */

authRouter.get("/logout", [verifyToken], logout);
authRouter.get("/logoutFromEverywhere", [verifyToken], logoutFromEverywhere);

export default authRouter;
