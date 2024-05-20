import { Router } from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { getTaskDetails,getPublicHolidays } from "../controller/commonController.js";

const commonRouter = Router();

//general apis
commonRouter.get('/getPublicHolidays',[verifyToken],getPublicHolidays);

//task related apis
commonRouter.get("/getTaskDetails/:id", [verifyToken], getTaskDetails);


export default commonRouter;
