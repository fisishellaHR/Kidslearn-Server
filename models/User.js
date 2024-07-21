import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  suggestions: [{ suggestion: { type: String } }],
  quiz: [
    {
      percobaan: { type: Number },
      judul: { type: String },
      score: { type: Number },
    },
  ],
});

UserSchema.index({ username: 1, email: 1 }, { unique: true });

const UserModel = mongoose.model("User", UserSchema);

export { UserModel as User };
