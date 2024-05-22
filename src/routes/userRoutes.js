import { Router } from "express";
import {
  getUserAllDetails,
  getUserProfileDetails,
  markAttendance,
  checkAttendance,
  getAllTasks,
  createTask,
  updateTask,
  getAllLeaves,
  getLeaveDetail,
  requestLeave,
  getAttendanceCalender,
  updateUserProfileDetails,
} from "../controller/userController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const userRouter = Router();

/* ------------------------ User Detail Related APIs ------------------------ */

userRouter.get("/getUserAllDetails", [verifyToken], getUserAllDetails);
userRouter.get("/getUserProfileDetails", [verifyToken], getUserProfileDetails);
userRouter.put(
  "/updateUserProfileDetails",
  [verifyToken],
  updateUserProfileDetails
);

/* ------------------------- Attendance Related APIs ------------------------ */

userRouter.post("/markAttendance", [verifyToken], markAttendance);
userRouter.get("/checkAttendance", [verifyToken], checkAttendance);
userRouter.get("/getAttendanceCalender", [verifyToken], getAttendanceCalender);

/* ---------------------------- Task Related APIs --------------------------- */

userRouter.get("/getAllTasks", [verifyToken], getAllTasks);
userRouter.post("/createTask", [verifyToken], createTask);
userRouter.put("/updateTask/:taskId", [verifyToken], updateTask);

/* --------------------------- Leaves Related APIs -------------------------- */

userRouter.get("/getAllLeaves", [verifyToken], getAllLeaves);
userRouter.get("/getLeaveDetail/:leaveId", [verifyToken], getLeaveDetail);
userRouter.get("/requestLeave/:leaveId", [verifyToken], requestLeave);

// userRouter.get("/getSettings", [verifyToken], getSettings);

export default userRouter;
