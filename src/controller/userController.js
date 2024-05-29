import db from "../config/connectDb.js";
import {
  IsActive,
  LeaveStatus,
  LeaveType,
  Role,
  TaskStatus,
  UserStatus,
} from "../config/constants.js";
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
    const annualLeavesQuery = `SELECT COUNT(*) AS annual_leaves FROM leaves WHERE user_id = ? AND leave_type = ? AND leave_status =?`;

    // Query to count casual leaves
    const casualLeavesQuery = `SELECT COUNT(*) AS casual_leaves FROM leaves WHERE user_id = ? AND leave_type = ? AND leave_status =?`;

    let [annual_leaves] = await db.query(annualLeavesQuery, [user.id, 0, 1]);
    let [casual_leaves] = await db.query(casualLeavesQuery, [user.id, 1, 1]);

    annual_leaves = annual_leaves[0].annual_leaves;
    casual_leaves = casual_leaves[0].casual_leaves;

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

    tasks.map((task) => {
      task.status = TaskStatus.getLabel(task.status);
    });

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
    WHERE user_id = ? AND (
      (MONTH(leave_start) = ? AND YEAR(leave_start) = ?) OR 
      (MONTH(leave_end) = ? AND YEAR(leave_end) = ?) OR 
      (leave_start <= ? AND leave_end >= ?)
    )
    `;

    const [leaves] = await db.query(leavesQuery, [
      user.id,
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

    console.log(public_holidays);

    const publicHolidayDates = new Set();

    public_holidays.forEach((holiday) => {
      let current = new Date(holiday.holiday_start_date);
      const end = new Date(holiday.holiday_end_date);

      while (current <= end) {
        publicHolidayDates.add(current.toISOString().split("T")[0]);
        current.setDate(current.getDate() + 1);
      }
    });

    console.log(publicHolidayDates);

    const formattedAttendances = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month - 1, day)
        .toISOString()
        .split("T")[0];

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
    const searchStatus =
      req.query.status != undefined ? parseInt(req.query.status) : undefined;

    console.log(req.query.status);

    let countTasksQuery = `SELECT COUNT(*) AS total FROM tasks where assigned_to = ?`;

    let tasksQuery = `
      SELECT 
        t.*, 
        CONCAT(assigneeUser.first_name, ' ', assigneeUser.last_name) AS assignee_name, 
        CONCAT(assignedToUser.first_name, ' ', assignedToUser.last_name) AS assigned_user_name 
      FROM tasks t
      LEFT JOIN users assigneeUser ON t.assignee = assigneeUser.id
      LEFT JOIN users assignedToUser ON t.assigned_to = assignedToUser.id
      WHERE t.assigned_to = ?`;

    // Query to count all pending tasks
    const pendingTasksCountQuery = `
      SELECT COUNT(*) AS pending_tasks_count 
      FROM tasks 
      WHERE assigned_to = ? AND status = ?
    `;

    let countQueryParams = [user.id];
    let tasksQueryParams = [user.id];

    if (searchStatus != undefined) {
      countTasksQuery += ` AND status = ?`;
      tasksQuery += ` AND t.status = ?`;
      countQueryParams.push(searchStatus);
      tasksQueryParams.push(searchStatus);
    }

    tasksQuery += ` LIMIT ? OFFSET ?`;

    tasksQueryParams.push(limit, offset);

    const [countResult] = await db.query(countTasksQuery, countQueryParams);
    const totalTasks = countResult[0].total;
    // Include pagination info in the response
    const paginationInfo = {
      total_tasks: totalTasks,
      page,
      limit,
      totalPages: Math.ceil(totalTasks / limit),
    };

    if (totalTasks === 0) {
      return sendResponseData(
        200,
        "No tasks found for this user",
        { tasks: [], pagination: paginationInfo },
        res
      );
    }

    if (paginationInfo.totalPages < page) {
      return sendResponseData(
        200,
        "No Page Found",
        { tasks: [], pagination: paginationInfo },
        res
      );
    }

    const [tasks] = await db.query(tasksQuery, tasksQueryParams);

    tasks.map((task) => {
      task.status = TaskStatus.getLabel(task.status);
    });

    let [pending_tasks_count] = await db.query(pendingTasksCountQuery, [
      user.id,
      0,
    ]);
    pending_tasks_count = pending_tasks_count[0].pending_tasks_count;

    const message =
      tasks.length === 0
        ? "No tasks assigned to this user"
        : "Tasks retrieved successfully";

    return sendResponseData(
      200,
      message,
      { tasks, pending_tasks_count, pagination: paginationInfo },
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

    const { name, description, assignee, is_urgent, assigned_date, deadline } =
      req.body;

    if (!user || Object.keys(user).length === 0) {
      return sendErrorResponse(400, "No user found in request", res);
    }

    // Validate dates
    const currentDate = new Date().setHours(0, 0, 0, 0); // Today's date with time set to 00:00:00
    const assignedDate = new Date(assigned_date).setHours(0, 0, 0, 0); // Assigned date with time set to 00:00:00
    const deadlineDate = new Date(deadline).setHours(0, 0, 0, 0); // Deadline date with time set to 00:00:00

    if (isNaN(assignedDate) || assignedDate < currentDate) {
      return sendErrorResponse(
        400,
        "Assigned date must be a valid date and ahead of the current datetime",
        res
      );
    }

    if (isNaN(deadlineDate) || deadlineDate < assignedDate) {
      return sendErrorResponse(
        400,
        "Deadline must be a valid date and ahead of the assigned date",
        res
      );
    }

    // create a new task for particular user

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
        0,
        user.id,
        is_urgent === undefined ? 0 : is_urgent,
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

const deleteTask = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    if (!taskId) {
      return sendErrorResponse(400, "Task ID not provided", res);
    }

    const query = `DELETE FROM tasks WHERE id = ? `;

    const [result] = await db.query(query, [taskId]);

    console.log(result);

    if (result.affectedRows === 0) {
      return sendErrorResponse(404, "Task not found", res);
    }

    return sendResponse(200, "Task deleted successfully", res);
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

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const searchStatus =
      req.query.status != undefined ? parseInt(req.query.status) : undefined;

    let countLeavesQuery = `SELECT COUNT(*) AS total FROM leaves where user_id = ?`;

    let leavesQuery = `SELECT l.*,CONCAT(requestUser.first_name,' ',requestUser.last_name) as requester_name,CONCAT(approvingUser.first_name,' ',approvingUser.last_name) as approver_name FROM leaves l LEFT JOIN users requestUser on l.user_id = requestUser.id LEFT JOIN users approvingUser on l.status_updated_by = approvingUser.id WHERE user_id = ?`;

    let countQueryParams = [user.id];
    let leavesQueryParams = [user.id];

    if (searchStatus != undefined) {
      countLeavesQuery += ` AND leave_status = ?`;
      leavesQuery += ` AND leave_status = ?`;
      countQueryParams.push(searchStatus);
      leavesQueryParams.push(searchStatus);
    }

    leavesQuery += ` LIMIT ? OFFSET ?`;

    leavesQueryParams.push(limit, offset);

    const [countResult] = await db.query(countLeavesQuery, countQueryParams);
    const totalLeaves = countResult[0].total;

    // Include pagination info in the response
    const paginationInfo = {
      total_leaves: totalLeaves,
      page,
      limit,
      totalPages: Math.ceil(totalLeaves / limit),
    };

    if (totalLeaves === 0) {
      return sendResponseData(
        200,
        "No Leaves Found for this user",
        { leaves: [], pagination: paginationInfo },
        res
      );
    }

    if (paginationInfo.totalPages < page) {
      return sendResponseData(
        200,
        "No Page Found",
        { leaves: [], pagination: paginationInfo },
        res
      );
    }

    const [leaves] = await db.query(leavesQuery, leavesQueryParams);

    leaves.map((leave) => {
      leave.leave_status = LeaveStatus.getLabel(leave.leave_status);
      leave.leave_type = LeaveType.getLabel(leave.leave_type);
    });

    const message =
      leaves.length === 0
        ? "No Leaves Found for this user"
        : "Leaves retrieved successfully";

    return sendResponseData(
      200,
      message,
      { leaves, pagination: paginationInfo },
      res
    );
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
    const { user } = req;
    const { start_date, end_date, description, leave_type } = req.body;

    // Validate required fields
    if (!start_date || !end_date || !leave_type || !description) {
      return sendErrorResponse(400, "Missing required fields", res);
    }

    if (!user || Object.keys(user).length === 0) {
      return sendErrorResponse(400, "No user found in request", res);
    }
    // Validate date format and values
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    const today = new Date();

    if (isNaN(startDate) || isNaN(endDate)) {
      return sendErrorResponse(400, "Invalid date format", res);
    }

    if (endDate < startDate) {
      return sendErrorResponse(
        400,
        "End date cannot be before start date",
        res
      );
    }

    if (startDate < today.setHours(0, 0, 0, 0)) {
      return sendErrorResponse(400, "Start date cannot be in the past", res);
    }
    // Validate leave type
    const leaveTypeValue = LeaveType.getValue(leave_type);
    if (leaveTypeValue === undefined) {
      return sendErrorResponse(400, "Invalid leave type", res);
    }

    const requestQuery = `INSERT INTO leaves (user_id,description,request_date,leave_status,leave_type,leave_start,leave_end) values (?,? ,now() ,0,? ,?, ?)`;

    const [requestLeave] = await db.query(requestQuery, [
      user.id,
      description,
      leaveTypeValue,
      start_date,
      end_date,
    ]);

    if (requestLeave.affectedRows === 0) {
      return sendErrorResponse(400, "Failed to request leave", res);
    }

    return sendResponse(200, "Requested Leave Successfully", res);
  } catch (error) {
    return sendErrorResponse(500, error.message, res);
  }
};

const deleteLeaveRequest = async (req, res) => {
  try {
    const leaveId = req.params.leaveId;
    if (!leaveId) {
      return sendErrorResponse(400, "Leave ID not provided", res);
    }

    const query = `DELETE FROM leaves WHERE id = ? `;

    const [result] = await db.query(query, [leaveId]);

    console.log(result);

    if (result.affectedRows === 0) {
      return sendErrorResponse(404, "Leave not found", res);
    }

    return sendResponse(200, "Leave deleted successfully", res);
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
  deleteTask,
  updateTask,
  getAllLeaves,
  getLeaveDetail,
  requestLeave,
  deleteLeaveRequest,
};
