import express from "express";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv, { config } from "dotenv";
import { errorMiddleware } from "./middlewares/errorMiddlewares.js";

const app = express();
dotenv.config();
config({ path: "./config.env" });

// Middlewares
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["POST", "PUT", "GET", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Routes
import authRouter from "./routes/authRouter.js";

app.use("/api/v1/auth", authRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

  mongoose
    .connect(process.env.MONGO_URL, {
      dbName: "Library",
    })
    .then(() => console.log("Database connected successfully"))
    .catch((err) => console.log(err.message));
});

app.use(errorMiddleware);
