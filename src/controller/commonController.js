import db from "../config/connectDb.js";
import {
  sendErrorResponse,
  sendErrorResponseData,
  sendResponseData,
} from "../utils/response.js";

const getTaskDetails = async (req, res) => {
  try {
    const { id } = req.params;
    let [task] = await db.query(`SELECT * FROM tasks WHERE id = ?`, [id]);

    if (!task || task.length === 0) {
      return sendErrorResponse(404, "Task not found", res);
    }
    task = task[0];

    const responseData = {
      ...task,
    };

    return sendResponseData(200, "Task details retrieved", responseData, res);
  } catch (error) {
    return sendErrorResponse(500, error.message, res);
  }
};

const getPublicHolidays = async (req, res) => {
  try {
    const user = req.user;

    console.log(user);

    if (!user || Object.keys(user).length === 0) {
      return sendErrorResponse(400, "No user found in request", res);
    }

    const query = `SELECT * FROM admin_public_holidays_settings ORDER BY holiday_date`;

    const [public_holidays] = await db.query(query);

    if (public_holidays.length === 0) {
      return sendErrorResponse(200, "No public holdiays set by admin", [], res);
    }

    return sendResponseData(
      200,
      "Public holidays retrieved",
      public_holidays,
      res
    );
  } catch (error) {
    return sendErrorResponse(500, error.message, res);
  }
};

export { getTaskDetails, getPublicHolidays };
