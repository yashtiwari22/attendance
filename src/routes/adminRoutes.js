import { Router } from "express";
import { isSuperAdmin, verifyToken } from "../middlewares/authMiddleware.js";
import {
  createUser,
  getUserDetails,
  getAllLeaveRequests,
  updateLeaveRequest,
  getAllUsers,
  addCompanyPolicy,
  addLeave,
  addPublicHoliday,
  deleteCompanyPolicy,
  deleteLeave,
  deletePublicHoliday,
  updateCompanyPolicy,
  updateLeave,
  updatePublicHoliday,
  getAttendanceCalendarForUser,
} from "../controller/adminController.js";

const adminRouter = Router();
/* ------------------------- User Related Admin Apis ------------------------ */

adminRouter.post("/createUser", [verifyToken, isSuperAdmin], createUser);
adminRouter.get(
  "/getUserDetails/:user_id",
  [verifyToken, isSuperAdmin],
  getUserDetails
);

adminRouter.get(
  "/getAllLeaveRequests",
  [verifyToken, isSuperAdmin],
  getAllLeaveRequests
);

adminRouter.put(
  "/updateLeaveRequest/:leave_id",
  [verifyToken, isSuperAdmin],
  updateLeaveRequest
);

adminRouter.get(
  "/getAttendanceCalendarForUser/:user_id",
  [verifyToken, isSuperAdmin],
  getAttendanceCalendarForUser
);

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

adminRouter.delete(
  "/deleteLeave/:leaveId",
  [verifyToken, isSuperAdmin],
  deleteLeave
);
adminRouter.delete(
  "/deletePublicHoliday/:holidayId",
  [verifyToken, isSuperAdmin],
  deletePublicHoliday
);
adminRouter.delete(
  "/deleteCompanyPolicy/:policyId",
  [verifyToken, isSuperAdmin],
  deleteCompanyPolicy
);

export default adminRouter;
