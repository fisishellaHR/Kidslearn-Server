import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true }, // Menghapus unique: true di sini
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const AdminModel = mongoose.model("Admin", AdminSchema);

export { AdminModel as Admin };
