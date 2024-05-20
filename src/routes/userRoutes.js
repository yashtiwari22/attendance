import { Router } from "express";
import {
  getUserAllDetails,
  getUserProfileDetails,
  markAttendance,
  getAllTasks,
  createTask,
  updateTask,
  getAllLeaves,
  getLeaveDetail,
  requestLeave,
} from "../controller/userController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const userRouter = Router();

// user detail related apis

userRouter.get("/getUserAllDetails", [verifyToken], getUserAllDetails);
userRouter.get("/getUserProfileDetails", [verifyToken], getUserProfileDetails);

//attendance related apis

userRouter.post("/markAttendance", [verifyToken], markAttendance);
// userRouter.get("/getAttendanceCalender", [verifyToken], getAttendanceCalender);

//task related apis

userRouter.get("/getAllTasks", [verifyToken], getAllTasks);
userRouter.post("/createTask", [verifyToken], createTask);
userRouter.put("/updateTask/:taskId", [verifyToken], updateTask);

//leaves related apis

userRouter.get("/getAllLeaves", [verifyToken], getAllLeaves);
userRouter.get("/getLeaveDetail/:leaveId", [verifyToken], getLeaveDetail);
userRouter.get("/requestLeave/:leaveId", [verifyToken], requestLeave);

// userRouter.get("/getSettings", [verifyToken], getSettings);

export default userRouter;
