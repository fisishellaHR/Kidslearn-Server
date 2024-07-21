import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { body, validationResult } from "express-validator";
import { Types } from "mongoose";
const { ObjectId } = Types;
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

router.post("/register", validateRegister, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;

  try {
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      console.log("Email already exists:", existingEmail);
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ status: true, message: "User berhasil dibuat" });
  } catch (error) {
    // Handle any errors
    console.error("Error in registration:", error);
    res.status(500).json({ message: "Registrasi gagal" });
  }
});

router.post("/login", validateLogin, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      console.log("User not found for email:", email);
      return res.status(400).json({ message: "User tidak ditemukan" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log("Password salah untuk user:", email);
      return res.status(400).json({ message: "Password salah" });
    }

    const token = jwt.sign({ username: user.username }, process.env.KEY, {
      expiresIn: "1h",
    });

    res.cookie("token", token, {
      maxAge: 3600000,
      httpOnly: true,
      sameSite: "Lax",
      secure: process.env.NODE_ENV === "production",
    });

    return res.status(200).json({
      status: true,
      message: "Login berhasil",
      token: token,
      email: email,
      username: user.username,
    });
  } catch (error) {
    console.error("Error saat login:", error);
    return res.status(500).json({ message: "Login gagal" });
  }
});

router.post("/forgot-password", validateForgotPassword, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found for email:", email);
      return res.status(400).json({ message: "User tidak ditemukan" });
    }

    const token = jwt.sign({ id: user._id }, process.env.KEY, {
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
      text: `http://localhost:5173/reset-password/${token}`,
    };

    transporter.sendMail(mailOptions, function (error) {
      if (error) {
        console.error("Error sending email:", error);
        return res
          .status(500)
          .json({ status: false, message: "Gagal mengirim email" });
      } else {
        console.log("Email sent to:", email);
        return res
          .status(200)
          .json({ status: true, message: "Email terkirim" });
      }
    });
  } catch (error) {
    console.error("Error during reset password process:", error);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
});

router.post("/reset-password", validateResetPassword, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { password, token } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.KEY);
    const userId = decoded.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    return res.json({ status: true, message: "Password berhasil diubah" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
});

router.get("/userpersonal", (req, res) => {
  res.clearCookie("token");
  return res.json({ status: true, message: "Logout berhasil" });
});

router.post("/addsuggestion", async (req, res) => {
  const { email, suggestion } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  try {
    if (!user.suggestions) {
      user.suggestions = [];
    }
    user.suggestions.push({ suggestion: suggestion });
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
      subject: "Halo Sobat KidsLearn",
      text: ` Terima Kasih Atas saran dan Kesannya : ${suggestion}`,
    };

    transporter.sendMail(mailOptions, function (error) {
      if (error) {
        console.error("Error sending email:", error);
        return res
          .status(500)
          .json({ status: false, message: "Gagal mengirim email" });
      } else {
        console.log("Email sent to:", email);
        return res
          .status(200)
          .json({ status: true, message: "Email terkirim" });
      }
    });
    await user.save();
    return res
      .status(200)
      .json({ status: true, message: "Suggestion submitted successfully" });
  } catch (error) {
    return res.status(400).json({ message: "error kali" });
  }
});

router.post("/submitresult", async (req, res) => {
  const { score, percobaan, judul, email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  try {
    if (!user.quiz) {
      user.quiz = [];
    }
    user.quiz.push({
      percobaan: user.quiz.length + 1,
      judul: judul,
      score: score,
    });
    await user.save();
    return res
      .status(200)
      .json({ status: true, message: "Quiz submitted successfully" });
  } catch (error) {
    return res.status(400).json({ message: "server error" });
  }
});

router.get("/getUsers", async (req, res) => {
  try {
    const users = await User.find();
    return res.json(users);
  } catch (error) {
    return res.status(400).json({ message: "server error" });
  }
});

router.delete("/deleteUser/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findByIdAndDelete(id);
    if (user) {
      return res.json({ message: "User deleted successfully" });
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/getUser", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json(users);
  } catch (error) {
    console.log(error);
  }
});

router.get("/getUserByUsername", async (req, res) => {
  const { username } = req.query;
  try {
    const user = await User.findOne({ username });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error });
  }
});

router.get("/:id/getUserByID", async (req, res) => {
  const { id } = req.params;
  try {
    const users = await User.findById(ObjectId(id));
    if (users) {
      res.json(users);
    } else {
      res.status(404).json({ message: "User tidak ditemukan" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error });
  }
});

router.patch("/updateUser", async (req, res) => {
  try {
    const updateUser = await User.updateOne(
      { _id: req.body.id },
      { $set: req.body }
    );
    res.status(201).json({ message: "berhasil mengupdate", updateUser });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "terjadi kesalahan" });
  }
});
export { router as UserRouter };
