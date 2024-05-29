import db from "../config/connectDb.js";
import bcrypt from "bcrypt";
import { loginSchema } from "../utils/validation.js";
import {
  sendErrorResponse,
  sendResponse,
  sendResponseData,
} from "../utils/response.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET_KEY } from "../config/secrets.js";

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
export { login, logoutFromEverywhere, logout };
