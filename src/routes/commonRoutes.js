import { Router } from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  getTaskDetails,
  getPublicHolidays,
} from "../controller/commonController.js";

const commonRouter = Router();

/* ------------------------------ General APIs ------------------------------ */
commonRouter.get("/getPublicHolidays", [verifyToken], getPublicHolidays);

/* ---------------------------- Task Related APIs --------------------------- */
commonRouter.get("/getTaskDetails/:id", [verifyToken], getTaskDetails);

export default commonRouter;
