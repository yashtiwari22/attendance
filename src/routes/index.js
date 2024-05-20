import { Router } from "express";
import authRouter from "./authRoutes.js";
import userRouter from "./userRoutes.js";
import adminRouter from "./adminRoutes.js";
import commonRouter from "./commonRoutes.js";

const rootRouter = Router();

rootRouter.use("/auth", authRouter);
rootRouter.use("/common", commonRouter);
rootRouter.use("/user", userRouter);
rootRouter.use("/admin", adminRouter);

export default rootRouter;
