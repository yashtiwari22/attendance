import { Router } from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  getTaskDetails,
  getPublicHolidays,
  getAllUsers,
} from "../controller/commonController.js";

const commonRouter = Router();

/* ------------------------------ General APIs ------------------------------ */
commonRouter.get("/getPublicHolidays", [verifyToken], getPublicHolidays);

commonRouter.get("/getAllUsers", [verifyToken], getAllUsers);

/* ---------------------------- Task Related APIs --------------------------- */
commonRouter.get("/getTaskDetails/:id", [verifyToken], getTaskDetails);

export default commonRouter;
