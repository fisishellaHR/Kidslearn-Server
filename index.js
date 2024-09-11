import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import routerHTML from "./routes/quizHTMLRoutes.js";
import routerCSS from "./routes/quizCSSRoutes.js";
import { UserRouter } from "./routes/var/task/user.js";
import { AdminRouter } from "./routes/Admin.js";
import { ModulesRouterHTML } from "./routes/ModulesHTML.js";
import { ModulesRouterCSS } from "./routes/ModulesCSS.js";

const app = express();
dotenv.config({ path: "./config/.env" });

app.use(
  cors({
    origin: "https://kidslearn-client.vercel.app",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  })
);

app.options("*", cors());
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  console.log(`Request Method: ${req.method}, Request URL: ${req.url}`);
  next();
});

app.use("/api/auth", UserRouter);
app.use("/api/auth/:id", UserRouter);
app.use("/api/admin", AdminRouter);
app.use("/api/module", ModulesRouterHTML);
app.use("/api/moduledua", ModulesRouterCSS);
app.use("/api/questions/html", routerHTML); // Rute untuk QuizHTML
app.use("/api/questions/css", routerCSS); // Rute untuk QuizCSS
mongoose
  .connect(process.env.URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("Connection error", err);
  });
