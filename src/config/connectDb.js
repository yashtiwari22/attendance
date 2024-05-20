// import { Sequelize } from "sequelize";
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_USERNAME } from "./secrets.js";
import mysql from "mysql2";

// normal sql connection
const db = mysql
  .createPool({
    host: DB_HOST,
    user: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_NAME,
    connectionLimit: 10,
  })
  .promise();

const connectDb = async () => {
  try {
    await db.getConnection();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

connectDb();

export default db;
