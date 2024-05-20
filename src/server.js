import express from "express";
import { PORT } from "./config/secrets.js";
import rootRouter from "./routes/index.js";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Welcome User, please mark your attendance");
});

app.use("/api/v1", rootRouter);

app.listen(PORT, () => {
  console.log("listening on port", PORT);
});
