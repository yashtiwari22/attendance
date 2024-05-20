import db from "../config/connectDb.js";
import bcrypt from "bcrypt";
import { signupSchema, loginSchema } from "../utils/validation.js";
import {
  sendErrorResponse,
  sendResponse,
  sendResponseData,
} from "../utils/response.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET_KEY } from "../config/secrets.js";

const signUp = async (req, res) => {
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
    const result = await signupSchema.validateAsync(req.body);

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
    const user_id = user.insertId;

    const createdPassword = await db.query(
      `INSERT INTO password_manager (user_id,email,password) VALUES (?, ?, ?)`,
      [user_id, email, bcrypt.hashSync(password, 10)]
    );
    return sendResponse(200, "User created successfully", res);
  } catch (error) {
    return sendErrorResponse(500, error.message, res);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { device_id, device_type, ip } = req.headers;

    console.log(device_id, device_type, ip);

    // Check if required fields are provided
    const result = await loginSchema.validateAsync(req.body);

    let [user] = await db.query(
      `Select * from password_manager where email = ?`,
      [email]
    );

    if (user.length === 0) {
      return sendErrorResponse(404, "User not found with email " + email, res);
    }

    const isPasswordCorrect = bcrypt.compareSync(password, user[0]?.password);

    if (!isPasswordCorrect)
      return sendErrorResponse(400, "Wrong password!", res);

    const token = await jwt.sign({ email: email }, JWT_SECRET_KEY);
    user = user[0];
    const loginLog = await db.query(
      `INSERT INTO login_logs(user_id,device_id,device_type,ip,access_token,last_login) VALUES(?,?,?,?,?,now())`,
      [user.user_id, device_id, device_type, ip, token]
    );

    const responseData = {
      token,
    };

    return sendResponseData(
      200,
      "User logged in successfully",
      responseData,
      res
    );
  } catch (error) {
    return sendErrorResponse(500, error.message, res);
  }
};

const logoutFromEverywhere = async (req, res) => {
  try {
    const user_id = req.user.id;

    if (user_id === undefined) {
      return sendErrorResponse(401, "Not able to logout", res);
    }

    const deleted_logs = await db.query(
      `DELETE FROM login_logs where user_id = ?`,
      [user_id]
    );
    return sendResponse(
      200,
      "User logged out successfully from everywhere",
      res
    );
  } catch (error) {
    return sendErrorResponse(500, error.message, res);
  }
};
const logout = async (req, res) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (token === undefined) {
      return sendErrorResponse(401, "Not able to logout", res);
    }

    const deleted_logs = await db.query(
      `DELETE FROM login_logs where access_token = ?`,
      [token]
    );

    return sendResponse(200, "User logged out successfully", res);
  } catch (error) {
    return sendErrorResponse(500, error.message, res);
  }
};
export { signUp, login, logoutFromEverywhere, logout };
