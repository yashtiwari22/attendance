import db from "../config/connectDb.js";
import {
  sendResponseData,
  sendErrorResponse,
  sendResponse,
} from "../utils/response.js";
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

    const [user_access] = await db.query(
      `SELECT can_view_leaves FROM user_access WHERE user_id = ?`,
      [user.id]
    );

    if (!user_access.length) {
      return sendErrorResponse(400, "User can't access leaves settings", res);
    }

    const { can_view_leaves } = user_access[0];

    const settings = {};
    if (can_view_leaves) {
      const [leaves_settings] = await db.query(
        `SELECT * FROM admin_leaves_settings`
      );
      settings.leaves_settings = leaves_settings;
    } else {
      return sendErrorResponse(400, "Can't view leaves", res);
    }

    console.log(settings);

    const leaves = [
      {
        id: 1,
        name: "casual leaves",
        consumed: casual_leaves,
        available: settings.leaves_settings[0].leaves_value,
      },
      {
        id: 2,
        name: "annual leaves",
        consumed: annual_leaves,
        available: settings.leaves_settings[1].leaves_value,
      },
    ];

    let [tasks] = await db.query(
      `SELECT * FROM tasks WHERE assigned_to = ? AND status = ?`,
      [user.id, 0]
    );

    tasks = tasks.slice(0, 10);
    const responseData = {
      id: user.id,
      name: user.display_name,
      role: user.role_id,
      user_status: user.user_status,
      is_active: user.is_active,
      leaves,
      tasks,
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

// const getSettings = async (req, res) => {
//   try {
//     const { user_id } = req.body;
//     const [user_access] = await db.query(
//       `SELECT can_view_leaves,can_view_public_holidays,can_view_policies FROM user_access WHERE user_id = ?`,
//       [user_id]
//     );

//     if (!user_access.length) {
//       return sendErrorResponse(400, "User access not found", res);
//     }

//     const { can_view_leaves, can_view_public_holidays, can_view_policies } =
//       user_access[0];

//     const settings = {};
//     if (can_view_leaves) {
//       const [leaves_settings] = await db.query(
//         `SELECT * FROM admin_leaves_settings`
//       );
//       settings.leaves_settings = leaves_settings[0];
//     } else {
//       return sendErrorResponse(400, "Can't view leaves", res);
//     }
//     if (can_view_public_holidays) {
//       const [public_holidays_settings] = await db.query(
//         `SELECT * FROM admin_public_holidays_settings`
//       );
//       settings.public_holidays_settings = public_holidays_settings[0];
//     } else {
//       return sendErrorResponse(400, "Can't view public holidays", res);
//     }

//     if (can_view_policies) {
//       const [policies_settings] = await db.query(
//         `SELECT * FROM admin_policies_settings`
//       );
//       settings.policies_settings = policies_settings[0];
//     } else {
//       return sendErrorResponse(400, "Can't view policies", res);
//     }

//     return sendResponseData(
//       200,
//       "Settings retrieved successfully",
//       settings,
//       res
//     );
//   } catch (error) {
//     return sendErrorResponse(500, error.message, res);
//   }
// };

const getUserProfileDetails = async (req, res) => {
  try {
    const user = req.user;

    if (!user || Object.keys(user).length === 0) {
      return sendErrorResponse(400, "No user found in request", res);
    }

    const responseData = {
      id: user.id,
      display_name: user.display_name,
      name: user.first_name + " " + user.last_name,
      email: user.email,
      phone: user.phone,
      image_url: user.image_url,
      designation: user.designation,
      department_id: user.department_id,
      user_status: user.user_status,
      is_active: user.is_active,
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

const markAttendance = async (req, res) => {
  try {
    const { user_id, date_time, location } = req.body;
    //Mark the attendance for user
    const [attendance] = await db.query(
      `INSERT INTO attendance (user_id,date_time,location) VALUES (?, ?, ?)`,
      [user_id, date_time, location]
    );

    return sendResponse(200, "Attendance marked successfully", res);
  } catch (error) {
    return sendErrorResponse(500, error.message, res);
  }
};

const getAttendanceCalender = async (req, res) => {
  try {
    const user = req.user;
    const { month, year } = req.params;

    if (!month || !year) {
      return res.status(400).send("Month and Year are required");
    }
  } catch (error) {
    return sendErrorResponse(500, error.message, res);
  }
};

const getAllTasks = async (req, res) => {
  try {
    const user = req.user;
    console.log(user);

    if (!user || Object.keys(user).length === 0) {
      return sendErrorResponse(400, "No user found in request", res);
    }

    const [tasks] = await db.query(
      `SELECT * FROM tasks WHERE assigned_to = ?`,
      [user.id]
    );

    if (tasks.length === 0) {
      return sendResponseData(200, "Tasks not assigned to this user", [], res);
    }

    return sendResponseData(200, "Tasks retrieved successfully", tasks, res);
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
      assignee_name,
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
        deadline,
        assignee_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?,?
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
        assignee_name,
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
  markAttendance,
  getAttendanceCalender,
  getAllTasks,
  createTask,
  updateTask,
  getAllLeaves,
  getLeaveDetail,
  requestLeave,
};
