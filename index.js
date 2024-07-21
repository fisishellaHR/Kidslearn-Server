import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { UserRouter } from "../server/routes/User.js";
import { AdminRouter } from "./routes/Admin.js";
import { ModulesRouterHTML } from "./routes/ModulesHTML.js";
import { ModulesRouterCSS } from "./routes/ModulesCSS.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  })
);
app.use(cookieParser());
mongoose.connect("mongodb://127.0.0.1:27017/authentication");
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

app.use("/auth", UserRouter);
app.use("/auth/:id", UserRouter);
app.use("/admin", AdminRouter);
app.use("/module", ModulesRouterHTML);
app.use("/moduledua", ModulesRouterCSS);
