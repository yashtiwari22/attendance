import db from "../config/connectDb.js";
import {
  Role,
  UserDepartment,
  IsActive,
  LeaveStatus,
  UserStatus,
} from "../config/constants.js";
import {
  sendErrorResponse,
  sendResponse,
  sendResponseData,
} from "../utils/response.js";
import bcrypt from "bcrypt";

import { createUserSchema } from "../utils/validation.js";

/* ---------------------------- User Related Apis --------------------------- */

const createUser = async (req, res) => {
  try {
    const {
      display_name,
      first_name,
      last_name,
      email,
      phone,
      password,
      image_url,
      designation,
      department_id,
      user_status,
      is_active,
      role_id,
    } = req.body;
    // Check if required fields are provided
    const result = await createUserSchema.validateAsync(req.body);

    console.log(result);
    // check if user already exists with same email

    let userWithEmailOrPhone = await db.query(
      `Select email,phone from users where email = ? OR phone = ?`,
      [email, phone]
    );
    if (userWithEmailOrPhone[0].length > 0) {
      return sendErrorResponse(
        403,
        "User elready exists with this email or phone",
        res
      );
    }

    //Insert into the database
    const [user] = await db.query(
      `INSERT INTO users (display_name,
        first_name,
        last_name,
        email,
        phone,
        image_url,
        designation,
        department_id,
        user_status,
        is_active,
        role_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, now(), now())`,
      [
        display_name,
        first_name,
        last_name,
        email,
        phone,
        image_url,
        designation,
        department_id,
        user_status,
        is_active,
        role_id,
      ]
    );
    console.log(user);

    if (user.affectedRows === 0) {
      return sendErrorResponse(404, "User cannot be created", res);
    }
    const user_id = user.insertId;

    const createdPassword = await db.query(
      `INSERT INTO password_manager (user_id,email,password) VALUES (?, ?, ?)`,
      [user_id, email, bcrypt.hashSync(password, 10)]
    );

    if (createdPassword.affectedRows === 0) {
      return sendErrorResponse(404, "User cannot be created", res);
    }

    const responseData = {
      inserted_id: user_id,
    };
    return sendResponseData(
      200,
      "User created successfully",
      responseData,
      res
    );
  } catch (error) {
    if (error.isJoi) {
      return sendErrorResponse(404, error.message, res);
    }
    return sendErrorResponse(500, error.message, res);
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = req.params.user_id;
    const updateFields = req.body;

    // Check if the user exists
    const existingUser = await db.query(`SELECT * FROM users WHERE id = ?`, [
      userId,
    ]);

    if (existingUser[0].length === 0) {
      return sendErrorResponse(404, "User not found", res);
    }

    // Construct the update query dynamically
    let updateQuery = "UPDATE users SET ";
    let queryParams = [];

    Object.keys(updateFields).forEach((key, index) => {
      updateQuery += `${key} = ?, `;
      queryParams.push(updateFields[key]);
    });

    // Remove the trailing comma and add the WHERE clause
    updateQuery = updateQuery.slice(0, -2);
    updateQuery += ` WHERE id = ?`;
    queryParams.push(userId);

    // Execute the update query
    const [updateUser] = await db.query(updateQuery, queryParams);

    console.log(updateUser);

    return sendResponse(200, "User updated successfully", res);
  } catch (error) {
    return sendErrorResponse(500, error.message, res);
  }
};
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.user_id;

    // Check if the user exists
    const existingUser = await db.query(`SELECT * FROM users WHERE id = ?`, [
      userId,
    ]);

    if (existingUser[0].length === 0) {
      return sendErrorResponse(404, "User not found", res);
    }
    // Delete user from the database
    const [deleteUser] = await db.query(`DELETE FROM users WHERE id = ?`, [
      userId,
    ]);

    if (deleteUser.affectedRows === 0) {
      return sendErrorResponse(404, "User cannot be deleted", res);
    }
    return sendResponse(200, "User deleted successfully", res);
  } catch (error) {
    return sendErrorResponse(500, error.message, res);
  }
};

const getAttendanceCalendarForUser = async (req, res) => {
  try {
    const user = req.params.user_id;
    const { month, year } = req.query;

    if (!month || !year) {
      return sendErrorResponse(400, "Month and Year are required", res);
    }

    const daysInMonth = new Date(year, month, 0).getDate();

    const query = `
      SELECT date_time, location FROM attendance 
      WHERE user_id = ? AND MONTH(date_time) = ? AND YEAR(date_time) = ?
    `;

    const [attendances] = await db.query(query, [user, month, year]);

    const leavesQuery = `
      SELECT leave_start, leave_end, leave_status FROM leaves 
      WHERE user_id = ? AND (
        (MONTH(leave_start) = ? AND YEAR(leave_start) = ?) OR 
        (MONTH(leave_end) = ? AND YEAR(leave_end) = ?) OR 
        (leave_start <= ? AND leave_end >= ?)
      )
    `;

    const [leaves] = await db.query(leavesQuery, [
      user,
      month,
      year,
      month,
      year,
      `${year}-${month}-01`,
      `${year}-${month}-${daysInMonth}`,
    ]);

    const publicHolidaysQuery = `
      SELECT holiday_name, holiday_start_date, holiday_end_date 
      FROM admin_public_holidays_settings 
      WHERE (
        (MONTH(holiday_start_date) = ? AND YEAR(holiday_start_date) = ?) OR 
        (MONTH(holiday_end_date) = ? AND YEAR(holiday_end_date) = ?) OR 
        (holiday_start_date <= ? AND holiday_end_date >= ?)
      )
    `;

    const [public_holidays] = await db.query(publicHolidaysQuery, [
      month,
      year,
      month,
      year,
      `${year}-${month}-01`,
      `${year}-${month}-${daysInMonth}`,
    ]);

    const formattedAttendances = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDateUTC = new Date(Date.UTC(year, month - 1, day));
      const currentDateISO = currentDateUTC.toISOString().split("T")[0];

      let isLeave = false;
      let isPublicHoliday = false;
      let checkInTime = null;
      let location = null;

      // Check if the current date is a public holiday
      for (const holiday of public_holidays) {
        const holidayStart = new Date(holiday.holiday_start_date)
          .toISOString()
          .split("T")[0];
        const holidayEnd = new Date(holiday.holiday_end_date)
          .toISOString()
          .split("T")[0];
        if (currentDateISO >= holidayStart && currentDateISO <= holidayEnd) {
          isPublicHoliday = true;
          break;
        }
      }

      // Check if the current date is a leave day
      for (const leave of leaves) {
        const leaveStart = new Date(leave.leave_start)
          .toISOString()
          .split("T")[0];
        const leaveEnd = new Date(leave.leave_end).toISOString().split("T")[0];
        if (
          currentDateISO >= leaveStart &&
          currentDateISO <= leaveEnd &&
          leave.leave_status
        ) {
          isLeave = true;
          break;
        }
      }

      // Check attendance for the current date
      for (const attendance of attendances) {
        const attendanceDate = new Date(attendance.date_time)
          .toISOString()
          .split("T")[0];
        if (currentDateISO === attendanceDate) {
          checkInTime = new Date(attendance.date_time)
            .toISOString()
            .split("T")[1];
          location = attendance.location;
          break;
        }
      }

      formattedAttendances.push({
        date: currentDateISO,
        checkInTime,
        location,
        isLeave,
        isPublicHoliday,
      });
    }

    // Sort the response array chronologically based on the date
    formattedAttendances.sort((a, b) => new Date(a.date) - new Date(b.date));

    return sendResponseData(200, "attendance", formattedAttendances, res);
  } catch (error) {
    return sendErrorResponse(500, error.message, res);
  }
};

const getUserDetails = async (req, res) => {
  try {
    const { user_id } = req.params;
    const query = `SELECT * FROM users where id = ?`;
    const [user] = await db.query(query, [user_id]);
    console.log(user);

    if (user.length === 0) {
      return sendErrorResponse(404, "User not found", res);
    }
    const userData = user[0];

    const responseData = {
      ...userData,
    };

    return sendResponseData(200, "user", responseData, res);
  } catch (error) {
    return sendErrorResponse(500, error.message, res);
  }
};

const getAllLeaveRequests = async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Count query to get total number of users matching the search criteria
    const countLeavesQuery = `SELECT COUNT(*) AS total FROM leaves WHERE leave_status = ?`;

    const query = `SELECT 
    leaves.*, 
    CONCAT( users.first_name," ",users.last_name) AS name,
      users.designation, 
    users.role_id, 
    users.user_status 
    FROM leaves JOIN users ON leaves.user_id = users.id WHERE leaves.leave_status = ? LIMIT ? OFFSET ?`;

    // Execute count query
    const [countResult] = await db.query(countLeavesQuery, [0]);
    const totalRequestedLeaves = countResult[0].total;
    // Include pagination info in the response
    const paginationInfo = {
      total_requested_leaves: totalRequestedLeaves,
      page,
      limit,
      totalPages: Math.ceil(totalRequestedLeaves / limit),
    };

    if (totalRequestedLeaves === 0) {
      return sendResponseData(
        200,
        "No request leaves found",
        { leave_requests: [], pagination: paginationInfo },
        res
      );
    }

    // If requested page exceeds total pages, return an empty result
    if (paginationInfo.totalPages < page) {
      return sendResponseData(
        200,
        "No Page Found",
        { leave_requests: [], pagination: paginationInfo },
        res
      );
    }

    const [leave_requests] = await db.query(query, [0, limit, offset]);

    if (leave_requests.length === 0) {
      return sendResponseData(200, "No leave requests found", [], res);
    }

    return sendResponseData(
      200,
      "leave requests",
      { leave_requests, pagination: paginationInfo },
      res
    );
  } catch (error) {
    return sendErrorResponse(500, error.message, res);
    s;
  }
};

const updateLeaveRequest = async (req, res) => {
  try {
    const user = req.user;
    const { leave_id } = req.params;
    const { leave_status } = req.body;

    const query = `UPDATE leaves SET leave_status = ? ,status_updated_by = ?,status_update_date = now() WHERE id =?`;

    const [updatedLeaveRequest] = await db.query(query, [
      leave_status,
      user.id,
      leave_id,
    ]);

    console.log(updatedLeaveRequest);

    if (updatedLeaveRequest.affectedRows === 0) {
      return sendErrorResponse(400, "Can't Update Leave Request", res);
    }
    if (leave_status === 1) {
      // Retrieve leave details
      const leaveDetailsQuery = `SELECT leave_start, leave_end FROM leaves WHERE id = ?`;
      const [leaveDetails] = await db.query(leaveDetailsQuery, [leave_id]);

      if (leaveDetails.length === 0) {
        return sendErrorResponse(400, "Leave details not found", res);
      }

      const leaveStart = new Date(leaveDetails[0].leave_start);
      const leaveEnd = new Date(leaveDetails[0].leave_end);

      // Function to convert date string to UTC date
      const convertToUTC = (dateString) => {
        const date = new Date(dateString);
        return new Date(
          Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
        );
      };

      const attendanceQuery = `INSERT INTO attendance (user_id, date_time, location) VALUES (?, ?, ?)`;

      // Loop through each day in the leave range
      for (
        let date = leaveStart;
        date <= leaveEnd;
        date.setDate(date.getDate() + 1)
      ) {
        const currentDateUTC = convertToUTC(date).toISOString().split("T")[0];
        await db.query(attendanceQuery, [
          user.id,
          currentDateUTC,
          "Ienergy Digital Building",
        ]);
      }
    }

    return sendResponse(200, "Updated Leave Request", res);
  } catch (error) {
    return sendErrorResponse(500, error.message, res);
  }
};
/* -------------------------- Settings related apis ------------------------- */

const addLeave = async (req, res) => {
  try {
    const { leave_type, leave_value } = req.body;

    console.log(leave_type, leave_value);

    const query = `INSERT INTO admin_leaves_settings (leave_type,leave_value) VALUES (?, ?)`;

    const [leave] = await db.query(query, [leave_type, leave_value]);

    if (!leave.affectedRows) {
      return sendResponse(404, "Leave can't be added", res);
    }
    return sendResponse(200, "Leave added successfully", res);
  } catch (error) {
    return sendErrorResponse(500, error.message, res);
  }
};

const addPublicHoliday = async (req, res) => {
  try {
    const { holiday_name, holiday_start_date, holiday_end_date } = req.body;

    console.log(holiday_name, holiday_start_date, holiday_end_date);

    const query = `INSERT INTO admin_public_holidays_settings (holiday_name,holiday_start_date,holiday_end_date) VALUES (?, ?,?)`;

    const [holiday] = await db.query(query, [
      holiday_name,
      holiday_start_date,
      holiday_end_date,
    ]);

    if (!holiday.affectedRows) {
      return sendResponse(404, "Holiday can't be added", res);
    }
    // Retrieve all users
    const usersQuery = `SELECT id FROM users`;
    const [users] = await db.query(usersQuery);

    // Function to convert date string to UTC date
    const convertToUTC = (dateString) => {
      const date = new Date(dateString);
      return new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
      );
    };

    const startDate = convertToUTC(holiday_start_date);
    const endDate = convertToUTC(holiday_end_date);

    const attendanceQuery = `INSERT INTO attendance (user_id, date_time, location) VALUES (?, ?, ?)`;

    for (
      let date = startDate;
      date <= endDate;
      date.setDate(date.getDate() + 1)
    ) {
      const currentDateUTC = date.toISOString().split("T")[0];

      for (const user of users) {
        await db.query(attendanceQuery, [
          user.id,
          currentDateUTC,
          "Ienergy Digital Building",
        ]);
      }
    }

    return sendResponse(
      200,
      "Holiday added and attendance marked successfully",
      res
    );
  } catch (error) {
    return sendErrorResponse(500, error.message, res);
  }
};

const addCompanyPolicy = async (req, res) => {
  try {
    const { policy_name, policy_details } = req.body;

    console.log(policy_name, policy_details);

    const query = `INSERT INTO admin_policies_settings (policy_name,policy_details) VALUES (?, ?)`;

    const [policy] = await db.query(query, [policy_name, policy_details]);

    if (!policy.affectedRows) {
      return sendResponse(404, "Policy can't be added", res);
    }
    return sendResponse(200, "Policy added successfully", res);
  } catch (error) {
    return sendErrorResponse(500, error.message, res);
  }
};

const updateLeave = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { leave_type, leave_value } = req.body;

    console.log(leaves_type, leaves_value);

    const query = `UPDATE admin_leaves_settings SET leave_value = ? AND leave_type = ? WHERE id = ?`;

    const [updatedLeave] = await db.query(query, [
      leave_value,
      leave_type,
      leaveId,
    ]);

    if (updatedLeave.affectedRows === 0) {
      return sendResponse(404, "Leave can't be updated", res);
    }
    return sendResponse(200, "Leave updated successfully", res);
  } catch (error) {
    return sendErrorResponse(500, error.message, res);
  }
};

const updatePublicHoliday = async (req, res) => {
  try {
    const { holidayId } = req.params;
    const { holiday_name, holiday_start_date, holiday_end_date } = req.body;

    console.log(holiday_name, holiday_start_date, holiday_end_date);

    const query = `UPDATE admin_public_holidays_settings SET holiday_name = ? ,holiday_start_date =? , holiday_end_date=? WHERE id = ?`;

    const [updatedPublicHoliday] = await db.query(query, [
      holiday_name,
      holiday_start_date,
      holiday_end_date,
      holidayId,
    ]);

    if (updatedPublicHoliday.affectedRows === 0) {
      return sendResponse(404, "Public holiday can't be updated", res);
    }
    return sendResponse(200, "Public holiday updated successfully", res);
  } catch (error) {
    return sendErrorResponse(500, error.message, res);
  }
};

const updateCompanyPolicy = async (req, res) => {
  try {
    const { policy_name, policy_details } = req.body;

    console.log(policy_name, policy_details);

    const query = `UPDATE admin_policies_settings SET leaves_value = ? WHERE leaves_type = ?`;

    const [updatedCompanyPolicy] = await db.query(query, [
      policy_name,
      policy_details,
    ]);

    if (updatedCompanyPolicy.affectedRows === 0) {
      return sendResponse(404, "Leaves can't be updated", res);
    }
    return sendResponse(200, "Leaves updated successfully", res);
  } catch (error) {
    return sendErrorResponse(500, error.message, res);
  }
};

const deleteLeave = async (req, res) => {
  try {
    const { leaveId } = req.params;

    if (!leaveId) {
      return sendResponse(404, "Leave Id not provided", res);
    }

    const query = `DELETE FROM admin_leaves_settings WHERE id = ?)`;

    const [deletedLeave] = await db.query(query, [leaveId]);

    console.log(deletedLeave);

    return sendResponse(200, "Leave deleted successfully", res);
  } catch (error) {
    return sendErrorResponse(500, error.message, res);
  }
};

const deletePublicHoliday = async (req, res) => {
  try {
    const { holidayId } = req.params;

    if (!holidayId) {
      return sendResponse(404, "Holiday Id not provided", res);
    }

    const query = `DELETE FROM admin_public_holidays_settings WHERE id = ?)`;

    const [deletedHoliday] = await db.query(query, [holidayId]);

    console.log(deletedHoliday);

    return sendResponse(200, "Public Holiday deleted successfully", res);
  } catch (error) {
    return sendErrorResponse(500, error.message, res);
  }
};

const deleteCompanyPolicy = async (req, res) => {
  try {
    const { policyId } = req.params;

    if (!policyId) {
      return sendResponse(404, "Policy Id not provided", res);
    }

    const query = `DELETE FROM admin_policies_settings WHERE id = ?)`;

    const [deletedPolicy] = await db.query(query, [policyId]);

    console.log(deletedPolicy);

    return sendResponse(200, "Policy deleted successfully", res);
  } catch (error) {
    return sendErrorResponse(500, error.message, res);
  }
};

export {
  createUser,
  updateUser,
  deleteUser,
  getUserDetails,
  getAttendanceCalendarForUser,
  getAllLeaveRequests,
  addLeave,
  addPublicHoliday,
  addCompanyPolicy,
  updateLeave,
  updateCompanyPolicy,
  updatePublicHoliday,
  deleteCompanyPolicy,
  deletePublicHoliday,
  deleteLeave,
  updateLeaveRequest,
};
