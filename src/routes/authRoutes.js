import { Router } from "express";
import {
  signUp,
  login,
  logout,
  logoutFromEverywhere,
} from "../controller/authController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const authRouter = Router();

/* ------------------------------ Signup Route ------------------------------ */

authRouter.post("/signUp", signUp);

/* ------------------------------- Login Route ------------------------------ */

authRouter.post("/login", login);

/* ------------------------------ Logout Routes ----------------------------- */

authRouter.get("/logout", [verifyToken], logout);
authRouter.get("/logoutFromEverywhere", [verifyToken], logoutFromEverywhere);

export default authRouter;
