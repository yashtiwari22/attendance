import { Router } from "express";
import {
  signUp,
  login,
  logout,
  logoutFromEverywhere,
} from "../controller/authController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const authRouter = Router();

authRouter.post("/signUp", signUp);
authRouter.post("/login", login);
authRouter.get("/logout", [verifyToken], logout);
authRouter.get("/logoutFromEverywhere", [verifyToken], logoutFromEverywhere);

export default authRouter;
