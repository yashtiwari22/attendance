import jwt from "jsonwebtoken";
import pkg from "jsonwebtoken";
import { sendErrorResponse } from "../utils/response.js";
import { JWT_SECRET_KEY } from "../config/secrets.js";
import db from "../config/connectDb.js";
const { JsonWebTokenError } = pkg;

// verify token for authentication

export const verifyToken = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    console.log(token);

    if (!token) {
      return sendErrorResponse(401, "No token provided", res);
    }

    const decoded = await jwt.verify(token, JWT_SECRET_KEY);

    console.log(decoded);

    const email = decoded.email;

    const [user] = await db.query(`Select * from users where email = ?`, [
      email,
    ]);

    if (user.length === 0) {
      return sendErrorResponse(401, "Not Authorized", res);
    }

    req.user = user[0];

    next();
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      return sendErrorResponse(401, "Not a valid token", res);
    }
    return sendErrorResponse(500, error.message, res);
  }
};

// role based authentication:
// 0. super_admin 1. admin 2. manager 3. staff

export const isSuperAdmin = async (req, res, next) => {
  try {
    const user = req.user;
    if (user.role_id != 0) {
      return sendErrorResponse(401, "User is not super admin", res);
    }
    next();
  } catch (error) {
    return sendErrorResponse(500, error.message, res);
  }
};

export const isAdmin = async (req, res, next) => {
  try {
    const user = req.user;
    if (user.role_id != 1) {
      return sendErrorResponse(401, "User is not admin", res);
    }
    next();
  } catch (error) {
    return sendErrorResponse(500, error.message, res);
  }
};

export const isManager = async (req, res, next) => {
  try {
    const user = req.user;
    if (user.role_id != 2) {
      return sendErrorResponse(401, "User is not manager", res);
    }
    next();
  } catch (error) {
    return sendErrorResponse(500, error.message, res);
  }
};
