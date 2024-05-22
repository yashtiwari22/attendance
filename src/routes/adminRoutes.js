import { Router } from "express";
import { isSuperAdmin, verifyToken } from "../middlewares/authMiddleware.js";
import {
  addCompanyPolicy,
  addLeave,
  addPublicHoliday,
  deleteCompanyPolicy,
  deleteLeave,
  deletePublicHoliday,
  updateCompanyPolicy,
  updateLeave,
  updatePublicHoliday,
} from "../controller/adminController.js";

const adminRouter = Router();

/* ----------------------------- Add Admin Settings ----------------------------- */

adminRouter.post("/addLeave", [verifyToken, isSuperAdmin], addLeave);
adminRouter.post(
  "/addPublicHoliday",
  [verifyToken, isSuperAdmin],
  addPublicHoliday
);
adminRouter.post(
  "/addCompanyPolicy",
  [verifyToken, isSuperAdmin],
  addCompanyPolicy
);

/* -------------------------- Update Admin Settings ------------------------- */

adminRouter.put(
  "/updateLeave/:leaveId",
  [verifyToken, isSuperAdmin],
  updateLeave
);
adminRouter.put(
  "/updatePublicHoliday/:holidayId",
  [verifyToken, isSuperAdmin],
  updatePublicHoliday
);
adminRouter.put(
  "/updateCompanyPolicy/:policyId",
  [verifyToken, isSuperAdmin],
  updateCompanyPolicy
);

/* -------------------------- Delete Admin Settings ------------------------- */

adminRouter.put(
  "/deleteLeave/:leaveId",
  [verifyToken, isSuperAdmin],
  deleteLeave
);
adminRouter.put(
  "/deletePublicHoliday/:holidayId",
  [verifyToken, isSuperAdmin],
  deletePublicHoliday
);
adminRouter.put(
  "/deleteCompanyPolicy/:policyId",
  [verifyToken, isSuperAdmin],
  deleteCompanyPolicy
);

export default adminRouter;
