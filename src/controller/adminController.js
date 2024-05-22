import db from "../config/connectDb.js";
import {
  sendErrorResponse,
  sendResponse,
  sendResponseData,
} from "../utils/response.js";
const getAllUsers = async (req, res) => {
  const [users] = await db.query("SELECT * FROM users");

  res.send(users);
};

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
    const { holiday_name, holiday_date } = req.body;

    console.log(holiday_name, holiday_date);

    const query = `INSERT INTO admin_public_holidays_settings (holiday_name,holiday_date) VALUES (?, ?)`;

    const [holiday] = await db.query(query, [holiday_name, holiday_date]);

    if (!holiday.affectedRows) {
      return sendResponse(404, "Holiday can't be added", res);
    }
    return sendResponse(200, "Holiday added successfully", res);
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
    const { holiday_name, holiday_date } = req.body;

    console.log(holiday_name, holiday_date);

    const query = `UPDATE admin_public_holidays_settings SET holiday_name = ? AND holiday_date WHERE id = ?`;

    const [updatedPublicHoliday] = await db.query(query, [
      holiday_name,
      holiday_date,
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
  getAllUsers,
  addLeave,
  addPublicHoliday,
  addCompanyPolicy,
  updateLeave,
  updateCompanyPolicy,
  updatePublicHoliday,
  deleteCompanyPolicy,
  deletePublicHoliday,
  deleteLeave,
};
