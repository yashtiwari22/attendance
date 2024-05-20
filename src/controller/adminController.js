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

const addLeaves = async (req, res) => {
  const { leaves_type, leaves_value } = req.body;

  console.log(leaves_type, leaves_value);

  const query = `INSERT INTO admin_leaves_settings (leaves_type,leaves_value) VALUES (?, ?)`;

  const [leaves] = await db.query(query, [leaves_type, leaves_value]);

  if (!leaves.affectedRows) {
    return sendResponse(404, "Leaves can't be added", res);
  }
  return sendResponse(200, "Leaves added successfully", res);
};

const addPublicHolidays = async (req, res) => {
  const { holiday_name, holiday_date } = req.body;

  console.log(holiday_name, holiday_date);

  const query = `INSERT INTO admin_public_holidays_settings (holiday_name,holiday_date) VALUES (?, ?)`;

  const [holidays] = await db.query(query, [holiday_name, holiday_date]);

  if (!holidays.affectedRows) {
    return sendResponse(404, "Holidays can't be added", res);
  }
  return sendResponse(200, "Holidays added successfully", res);
};

const addCompanyPolicies = async (req, res) => {
  const { policy_name, policy_details } = req.body;

  console.log(policy_name, policy_details);

  const query = `INSERT INTO admin_policies_settings (policy_name,policy_details) VALUES (?, ?)`;

  const [policies] = await db.query(query, [policy_name, policy_details]);

  if (!policies.affectedRows) {
    return sendResponse(404, "Policies can't be added", res);
  }
  return sendResponse(200, "Policies added successfully", res);
};

const updateLeaves = async (req, res) => {
  const { leaves_type, leaves_value } = req.body;

  console.log(leaves_type, leaves_value);

  const query = `INSERT INTO admin_leaves_settings (leaves_type,leaves_value) VALUES (?, ?)`;

  const [leaves] = await db.query(query, [leaves_type, leaves_value]);

  if (!leaves.affectedRows) {
    return sendResponse(404, "Leaves can't be added", res);
  }
  return sendResponse(200, "Leaves added successfully", res);
};

const updatePublicHolidays = async (req, res) => {
  const { holiday_name, holiday_date } = req.body;

  console.log(holiday_name, holiday_date);

  const query = `INSERT INTO admin_public_holidays_settings (holiday_name,holiday_date) VALUES (?, ?)`;

  const [holidays] = await db.query(query, [holiday_name, holiday_date]);

  if (!holidays.affectedRows) {
    return sendResponse(404, "Holidays can't be added", res);
  }
  return sendResponse(200, "Holidays added successfully", res);
};

const updateCompanyPolicies = async (req, res) => {
  const { policy_name, policy_details } = req.body;

  console.log(policy_name, policy_details);

  const query = `INSERT INTO admin_policies_settings (policy_name,policy_details) VALUES (?, ?)`;

  const [policies] = await db.query(query, [policy_name, policy_details]);

  if (!policies.affectedRows) {
    return sendResponse(404, "Policies can't be added", res);
  }
  return sendResponse(200, "Policies added successfully", res);
};

const deleteLeaves = async (req, res) => {
  const { leaves_type, leaves_value } = req.body;

  console.log(leaves_type, leaves_value);

  const query = `INSERT INTO admin_leaves_settings (leaves_type,leaves_value) VALUES (?, ?)`;

  const [leaves] = await db.query(query, [leaves_type, leaves_value]);

  if (!leaves.affectedRows) {
    return sendResponse(404, "Leaves can't be added", res);
  }
  return sendResponse(200, "Leaves added successfully", res);
};

const deletePublicHolidays = async (req, res) => {
  const { holiday_name, holiday_date } = req.body;

  console.log(holiday_name, holiday_date);

  const query = `INSERT INTO admin_public_holidays_settings (holiday_name,holiday_date) VALUES (?, ?)`;

  const [holidays] = await db.query(query, [holiday_name, holiday_date]);

  if (!holidays.affectedRows) {
    return sendResponse(404, "Holidays can't be added", res);
  }
  return sendResponse(200, "Holidays added successfully", res);
};

const deleteCompanyPolicies = async (req, res) => {
  const { policy_name, policy_details } = req.body;

  console.log(policy_name, policy_details);

  const query = `INSERT INTO admin_policies_settings (policy_name,policy_details) VALUES (?, ?)`;

  const [policies] = await db.query(query, [policy_name, policy_details]);

  if (!policies.affectedRows) {
    return sendResponse(404, "Policies can't be added", res);
  }
  return sendResponse(200, "Policies added successfully", res);
};

export {
  getAllUsers,
  addLeaves,
  addPublicHolidays,
  addCompanyPolicies,
  updateLeaves,
  updateCompanyPolicies,
  updatePublicHolidays,
  deleteCompanyPolicies,
  deletePublicHolidays,
  deleteLeaves,
};
