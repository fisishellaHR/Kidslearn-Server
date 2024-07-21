import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Admin } from "../models/Admin.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { body, validationResult } from "express-validator";
dotenv.config();

const router = express.Router();

const validateRegister = [
  body("username").notEmpty().withMessage("Username tidak boleh kosong"),
  body("email").isEmail().withMessage("Email tidak valid"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password minimal 6 karakter"),
];

const validateLogin = [
  body("email").isEmail().withMessage("Email tidak valid"),
  body("password").notEmpty().withMessage("Password tidak boleh kosong"),
];

const validateForgotPassword = [
  body("email").isEmail().withMessage("Email tidak valid"),
];

const validateResetPassword = [
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password minimal 6 karakter"),
];

router.post("/registeradmin", validateRegister, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;

  try {
    const existingEmail = await Admin.findOne({ email });
    if (existingEmail) {
      console.log("Email sudah terdaftar:", existingEmail);
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      username,
      email,
      password: hashedPassword,
    });

    await newAdmin.save();

    res.status(201).json({ status: true, message: "Admin berhasil dibuat" });
  } catch (error) {
    console.error("Error in registration:", error);
    res.status(500).json({ message: "Registrasi gagal" });
  }
});

router.post("/loginadmin", validateLogin, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });

    if (!admin) {
      console.log("Admin tidak ditemukan untuk email:", email);
      return res.status(400).json({ message: "Admin tidak ditemukan" });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      console.log("Password salah untuk admin:", email);
      return res.status(400).json({ message: "Password salah" });
    }

    const token = jwt.sign({ username: admin.username }, process.env.KEY, {
      expiresIn: "1h",
    });

    res.cookie("token", token, { maxAge: 3600000, httpOnly: true });

    return res.status(200).json({
      status: true,
      message: "Login berhasil",
      token: token,
    });
  } catch (error) {
    console.error("Error saat login:", error);
    return res.status(500).json({ message: "Login gagal" });
  }
});

router.post(
  "/forgot-passwordadmin",
  validateForgotPassword,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    try {
      const admin = await Admin.findOne({ email });
      if (!admin) {
        console.log("Admin tidak ditemukan untuk email:", email);
        return res.status(400).json({ message: "Admin tidak ditemukan" });
      }

      const token = jwt.sign({ id: admin._id }, process.env.KEY, {
        expiresIn: "10m",
      });

      var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      var mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Reset Password",
        text: `http://localhost:5173/reset-passwordadmin/${token}`,
      };

      transporter.sendMail(mailOptions, function (error) {
        if (error) {
          console.error("Error sending email:", error);
          return res
            .status(500)
            .json({ status: false, message: "Gagal mengirim email" });
        } else {
          console.log("Email terkirim ke:", email);
          return res
            .status(200)
            .json({ status: true, message: "Email terkirim" });
        }
      });
    } catch (error) {
      console.error("Error during reset password process:", error);
      return res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
  }
);

router.post("/reset-passwordadmin", validateResetPassword, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { password, token } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.KEY);
    const adminId = decoded.id;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin tidak ditemukan" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    admin.password = hashedPassword;
    await admin.save();

    return res.json({ status: true, message: "Password berhasil diubah" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
});

router.get("/logoutadmin", (req, res) => {
  res.clearCookie("token");
  return res.json({ status: true, message: "Logout berhasil" });
});

export { router as AdminRouter };
