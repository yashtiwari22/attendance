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

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Query to get the total count of public holidays

    const countQuery = `SELECT COUNT(*) AS total FROM admin_public_holidays_settings`;
    const [countResult] = await db.query(countQuery);
    const totalPublicHolidays = countResult[0].total;

    // Include pagination info in the response
    const paginationInfo = {
      total_public_holidays: totalPublicHolidays,
      page,
      limit,
      totalPages: Math.ceil(totalPublicHolidays / limit),
    };

    if (paginationInfo.totalPages < page) {
      return sendResponseData(
        200,
        "No Page Found",
        { public_holidays: [], pagination: paginationInfo },
        res
      );
    }

    const query = `SELECT * FROM admin_public_holidays_settings ORDER BY holiday_date LIMIT ? OFFSET ?`;

    const [public_holidays] = await db.query(query, [limit, offset]);

    if (public_holidays.length === 0) {
      return sendResponseData(
        200,
        "No public holdiays set by admin",
        { public_holidays, pagination: paginationInfo },
        res
      );
    }

    return sendResponseData(
      200,
      "Public holidays retrieved",
      { public_holidays, pagination: paginationInfo },
      res
    );
  } catch (error) {
    return sendErrorResponse(500, error.message, res);
  }
};

export { getTaskDetails, getPublicHolidays };
