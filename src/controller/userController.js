import db from "../config/connectDb.js";
import { IsActive, Role, UserStatus } from "../config/constants.js";
import {
  sendResponseData,
  sendErrorResponse,
  sendResponse,
} from "../utils/response.js";

/* ------------------------ User Detail Related Apis ------------------------ */
const getUserAllDetails = async (req, res) => {
  try {
    const user = req.user;

    if (!user || Object.keys(user).length === 0) {
      return sendErrorResponse(400, "No user found in request", res);
    }

    // Query to count annual leaves
    const annualLeavesQuery = `SELECT COUNT(*) AS annual_leaves FROM leaves WHERE user_id = ? AND leave_type = ?`;

    // Query to count casual leaves
    const casualLeavesQuery = `SELECT COUNT(*) AS casual_leaves FROM leaves WHERE user_id = ? AND leave_type = ?`;

    let [annual_leaves] = await db.query(annualLeavesQuery, [user.id, 0]);
    let [casual_leaves] = await db.query(casualLeavesQuery, [user.id, 1]);

    annual_leaves = annual_leaves[0].annual_leaves;
    casual_leaves = casual_leaves[0].casual_leaves;

    // const [user_access] = await db.query(
    //   `SELECT can_view_leaves FROM user_access WHERE user_id = ?`,
    //   [user.id]
    // );

    // if (!user_access.length) {
    //   return sendErrorResponse(400, "User can't access leaves settings", res);
    // }

    // const { can_view_leaves } = user_access[0];

    const settings = {};

    const [leaves_settings] = await db.query(
      `SELECT * FROM admin_leaves_settings`
    );
    settings.leaves_settings = leaves_settings;

    const leaves = [
      {
        id: 1,
        name: "casual leaves",
        consumed: casual_leaves,
        available: settings.leaves_settings[0].leave_value,
      },
      {
        id: 2,
        name: "annual leaves",
        consumed: annual_leaves,
        available: settings.leaves_settings[1].leave_value,
      },
    ];

    console.log(leaves);

    const tasksQuery = `
    SELECT 
      t.*, 
      CONCAT(assigneeUser.first_name, ' ', assigneeUser.last_name) AS assignee_name, 
      CONCAT(assignedToUser.first_name, ' ', assignedToUser.last_name) AS assigned_user_name 
    FROM tasks t
    LEFT JOIN users assigneeUser ON t.assignee = assigneeUser.id
    LEFT JOIN users assignedToUser ON t.assigned_to = assignedToUser.id
    WHERE t.assigned_to = ? AND t.status = ?
    LIMIT 10
  `;

    let [tasks] = await db.query(tasksQuery, [user.id, 0]);

    // Query to count all pending tasks
    const pendingTasksCountQuery = `
        SELECT COUNT(*) AS pending_tasks_count 
        FROM tasks 
        WHERE assigned_to = ? AND status = ?
      `;

    let [pending_tasks_count] = await db.query(pendingTasksCountQuery, [
      user.id,
      0,
    ]);
    pending_tasks_count = pending_tasks_count[0].pending_tasks_count;

    const responseData = {
      id: user.id,
      name: user.first_name + " " + user.last_name,
      role: user.role_id,
      user_status: user.user_status,
      is_active: user.is_active,
      leaves,
      tasks,
      pending_tasks_count,
    };

    return sendResponseData(
      200,
      "User details retrieved successfully",
      responseData,
      res
    );
  } catch (error) {
    console.error(error.message);
    return sendErrorResponse(500, error.message, res);
  }
};

const getUserProfileDetails = async (req, res) => {
  try {
    const user = req.user;

    if (!user || Object.keys(user).length === 0) {
      return sendErrorResponse(400, "No user found in request", res);
    }

    const query = `SELECT * FROM department_manager`;

    const [departments] = await db.query(query);
    console.log(departments);

    let department_name = null;

    departments.map((department) => {
      if (department.department_id === user.department_id) {
        department_name = department.department_name;
        return;
      }
    });

    const responseData = {
      id: user.id,
      display_name: user.display_name,
      name: user.first_name + " " + user.last_name,
      email: user.email,
      phone: user.phone,
      image_url: user.image_url,
      designation: user.designation,
      department: department_name,
      user_status: UserStatus.getLabel(user.user_status),
      is_active: IsActive.getLabel(user.is_active),
      role: Role.getLabel(user.role_id),
    };

    return sendResponseData(
      200,
      "User profile retrieved successfully",
      responseData,
      res
    );
  } catch (error) {
    return sendErrorResponse(500, error.message, res);
  }
};

const updateUserProfileDetails = async (req, res) => {
  try {
    const user = req.user;

    console.log(user.id);

    const { display_name, image_url } = req.body;

    if (!user || Object.keys(user).length === 0) {
      return sendErrorResponse(400, "No user found in request", res);
    }

    const updates = [];
    const values = [];

    if (display_name !== undefined) {
      updates.push("display_name = ?");
      values.push(display_name);
    }

    if (image_url !== undefined) {
      updates.push("image_url = ?");
      values.push(image_url);
    }

    if (updates.length === 0) {
      return sendErrorResponse(400, "No fields to update", res);
    }

    values.push(user.id);

    const updateQuery = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;

    const [result] = await db.query(updateQuery, values);

    if (result.affectedRows === 0) {
      return sendErrorResponse(400, "User profile not updated", res);
    }
    return sendResponse(200, "User profile updated successfully", res);
  } catch (error) {
    return sendErrorResponse(500, error.message, res);
  }
};

/* ------------------------- Attendance Related Apis ------------------------ */
const markAttendance = async (req, res) => {
  try {
    const user = req.user;

    if (!user || Object.keys(user).length === 0) {
      return sendErrorResponse(400, "No user found in request", res);
    }
    const { date_time, location } = req.body;

    // Extract the date part from date_time to check for existing attendance
    const date = new Date(date_time).toISOString().split("T")[0];

    // Check if the user has already marked attendance for the given day
    const [existingAttendance] = await db.query(
      `SELECT * FROM attendance WHERE user_id = ? AND DATE(date_time) = ?`,
      [user.id, date]
    );

    if (existingAttendance.length > 0) {
      return sendErrorResponse(400, "Attendance already marked for today", res);
    }
    //Mark the attendance for user
    const [attendance] = await db.query(
      `INSERT INTO attendance (user_id,date_time,location) VALUES (?, ?, ?)`,
      [user.id, date_time, location]
    );

    return sendResponse(200, "Attendance marked successfully", res);
  } catch (error) {
    return sendErrorResponse(500, error.message, res);
  }
};

const checkAttendance = async (req, res) => {
  try {
    const user = req.user;

    if (!user || Object.keys(user).length === 0) {
      return sendErrorResponse(400, "No user found in request", res);
    }

    // Extract the date part from date_time to check for existing attendance
    const date = new Date(Date.now()).toISOString().split("T")[0];

    // Check if the user has already marked attendance for the given day
    const [existingAttendance] = await db.query(
      `SELECT * FROM attendance WHERE user_id = ? AND DATE(date_time) = ?`,
      [user.id, date]
    );
    let responseData;

    if (existingAttendance.length > 0) {
      responseData = {
        is_marked: true,
        ...existingAttendance[0],
      };
    } else {
      responseData = {
        isMarked: false,
      };
    }

    return sendResponseData(200, "Attendance", responseData, res);
  } catch (error) {
    return sendErrorResponse(500, error.message, res);
  }
};

const getAttendanceCalendar = async (req, res) => {
  try {
    const user = req.user;
    const { month, year } = req.query;

    if (!month || !year) {
      return sendErrorResponse(400, "Month and Year are required", res);
    }

    const daysInMonth = new Date(year, month, 0).getDate(); // Get the number of days in the given month

    const query = `
      SELECT date_time, location FROM attendance 
      WHERE user_id = ? AND MONTH(date_time) = ? AND YEAR(date_time) = ?
    `;

    const [attendances] = await db.query(query, [user.id, month, year]);

    const leavesQuery = `
      SELECT leave_start, leave_end, leave_status FROM leaves 
      WHERE user_id = ? AND MONTH(leave_start) = ? AND YEAR(leave_end) = ?
    `;

    const [leaves] = await db.query(leavesQuery, [user.id, month, year]);

    const publicHolidaysQuery = `
      SELECT holiday_date FROM admin_public_holidays_settings 
      WHERE MONTH(holiday_date) = ? AND YEAR(holiday_date) = ?
    `;

    const [public_holidays] = await db.query(publicHolidaysQuery, [
      month,
      year,
    ]);

    const publicHolidayDates = new Set(
      public_holidays.map(
        (holiday) => holiday.holiday_date.toISOString().split("T")[0]
      )
    );

    const formattedAttendances = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month - 1, day)
        .toISOString()
        .split("T")[0];
      console.log(currentDate);

      let isLeave = false;
      let isPublicHoliday = publicHolidayDates.has(currentDate);
      let checkInTime = null;
      let location = null;

      for (const att of attendances) {
        const attendanceDate = att.date_time.toISOString().split("T")[0];
        if (attendanceDate === currentDate) {
          checkInTime = att.date_time.toISOString().split("T")[1].split(".")[0];
          location = att.location;
          break;
        }
      }

      if (!isPublicHoliday) {
        for (const leave of leaves) {
          const leaveStart = leave.leave_start.toISOString().split("T")[0];
          const leaveEnd = leave.leave_end.toISOString().split("T")[0];
          if (
            currentDate >= leaveStart &&
            currentDate <= leaveEnd &&
            leave.leave_status
          ) {
            isLeave = true;
            checkInTime = null;
            location = null;
            break;
          }
        }
      }

      formattedAttendances.push({
        date: currentDate,
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

/* ---------------------------- Task related Apis --------------------------- */

const getAllTasks = async (req, res) => {
  try {
    const user = req.user;
    console.log(user);

    if (!user || Object.keys(user).length === 0) {
      return sendErrorResponse(400, "No user found in request", res);
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const countTasksQuery = `SELECT COUNT(*) AS total FROM tasks where assigned_to = ?`;

    const [countResult] = await db.query(countTasksQuery, [user.id]);
    const totalTasks = countResult[0].total;

    const [tasks] = await db.query(
      `SELECT * FROM tasks WHERE assigned_to = ? LIMIT ? OFFSET ?`,
      [user.id, limit, offset]
    );

    if (tasks.length === 0) {
      return sendResponseData(200, "Tasks not assigned to this user", [], res);
    }

    // Include pagination info in the response
    const paginationInfo = {
      total_tasks: totalTasks,
      page,
      limit,
      totalPages: Math.ceil(totalTasks / limit),
    };

    return sendResponseData(
      200,
      "Tasks retrieved successfully",
      { tasks, pagination: paginationInfo },
      res
    );
  } catch (error) {
    return sendErrorResponse(500, error.message, res);
  }
};

const createTask = async (req, res) => {
  try {
    const user = req.user;
    console.log(user);

    const {
      name,
      description,
      assignee,
      status,
      is_urgent,
      assigned_date,
      deadline,
    } = req.body;

    if (!user || Object.keys(user).length === 0) {
      return sendErrorResponse(400, "No user found in request", res);
    }

    //create a new task for particular user

    const [task] = await db.query(
      `INSERT INTO tasks (name,
        description,
        assignee,
        status,
        assigned_to,
        is_urgent,
        assigned_date,
        deadline) VALUES (?, ?, ?, ?, ?, ?, ?, ?
        )`,
      [
        name,
        description,
        assignee,
        status,
        user.id,
        is_urgent,
        assigned_date,
        deadline,
      ]
    );
    if (!task || !task.insertId) {
      return sendErrorResponse(400, "Failed to create task", res);
    }

    const responseData = {
      task_id: task.insertId,
    };
    return sendResponseData(
      200,
      "Tasks created successfully",
      responseData,
      res
    );
  } catch (error) {
    return sendErrorResponse(500, error.message, res);
  }
};

const updateTask = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    if (!taskId) {
      return sendErrorResponse(400, "Task ID not provided", res);
    }

    const { status } = req.body;

    const query = `UPDATE tasks SET status = ? WHERE id = ? `;

    const [result] = await db.query(query, [status, taskId]);

    console.log(result);

    if (result.affectedRows === 0) {
      return sendErrorResponse(404, "Task not found or unauthorized", res);
    }

    return sendResponse(200, "Task updated successfully", res);
  } catch (error) {
    return sendErrorResponse(500, error.message, res);
  }
};

/* --------------------------- Leave Related Apis --------------------------- */

const getAllLeaves = async (req, res) => {
  try {
    const user = req.user;
    console.log(user);

    if (!user || Object.keys(user).length === 0) {
      return sendErrorResponse(400, "No user found in request", res);
    }

    const [leaves] = await db.query(`SELECT * FROM leaves WHERE user_id = ?`, [
      user.id,
    ]);

    if (leaves.length === 0) {
      return sendResponseData(200, "No leaves created for this user", [], res);
    }

    return sendResponseData(200, "Leaves retrieved successfully", leaves, res);
  } catch (error) {
    return sendErrorResponse(500, error.message, res);
  }
};
const getLeaveDetail = async (req, res) => {
  try {
    const leaveId = req.params.leaveId;
    if (!leaveId) {
      return sendErrorResponse(400, "Leave ID not provided", res);
    }

    let [leave] = await db.query(`SELECT * FROM leaves WHERE id = ?`, [
      leaveId,
    ]);
    const responseData = {
      ...leave[0],
    };
    if (leave.length === 0) {
      return sendResponseData(200, "No such leaves", {}, res);
    }

    return sendResponseData(
      200,
      "Leave retrieved successfully",
      responseData,
      res
    );
  } catch (error) {
    return sendErrorResponse(500, error.message, res);
  }
};
const requestLeave = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    if (!taskId) {
      return sendErrorResponse(400, "Task ID not provided", res);
    }

    const { status } = req.body;

    const query = `UPDATE tasks SET status = ? WHERE id = ? `;

    const [result] = await db.query(query, [status, taskId]);

    console.log(result);

    if (result.affectedRows === 0) {
      return sendErrorResponse(404, "Task not found or unauthorized", res);
    }

    return sendResponse(200, "Task updated successfully", res);
  } catch (error) {
    return sendErrorResponse(500, error.message, res);
  }
};

export {
  getUserAllDetails,
  getUserProfileDetails,
  updateUserProfileDetails,
  markAttendance,
  checkAttendance,
  getAttendanceCalendar,
  getAllTasks,
  createTask,
  updateTask,
  getAllLeaves,
  getLeaveDetail,
  requestLeave,
};
