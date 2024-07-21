import express from "express";
import { ModulesCSS } from "../models/ModulesCSS.js";
import dotenv from "dotenv";
import { ModulesHTML } from "../models/ModulesHTML.js";

dotenv.config();

const router = express.Router();

//endpoint untuk mengisi modul
router.post("/addModules", async (req, res) => {
  const module = new ModulesCSS(req.body);
  try {
    const insertModule = await module.save();
    res.status(201).json(insertModule);
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json({ message: "terjadi kesalahan saat menambah module" });
  }
});

router.get("/getModules", async (req, res) => {
  try {
    const users = await ModulesCSS.find();
    res.json(users);
  } catch (error) {
    console.log(error);
  }
});

router.delete("/deleteModules/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deleteModule = await ModulesCSS.findByIdAndDelete(id);
    res.json(deleteModule);
  } catch (error) {
    console.log(error);
  }
});

router.patch("/updateModule", async (req, res) => {
  try {
    const updateModule = await ModulesCSS.updateOne(
      { _id: req.body.id },
      { $set: req.body }
    );
    res.status(201).json({ message: "berhasil mengupdate", updateModule });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "terjadi kesalahan" });
  }
});

export { router as ModulesRouterCSS };
