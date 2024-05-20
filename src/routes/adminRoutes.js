import { Router } from "express";
import { isSuperAdmin, verifyToken } from "../middlewares/authMiddleware.js";
import {
  addCompanyPolicies,
  addLeaves,
  addPublicHolidays,
} from "../controller/adminController.js";

const adminRouter = Router();

adminRouter.post("/addLeaves", [verifyToken, isSuperAdmin], addLeaves);
adminRouter.post(
  "/addPublicHolidays",
  [verifyToken, isSuperAdmin],
  addPublicHolidays
);
adminRouter.post(
  "/addCompanyPolicies",
  [verifyToken, isSuperAdmin],
  addCompanyPolicies
);

export default adminRouter;
