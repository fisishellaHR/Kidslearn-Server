import mongoose from "mongoose";

const Scheme = mongoose.Schema;

const UserSchema = new Scheme({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  suggestions: [{ suggestion: { type: String } }],
});

UserSchema.index({ username: 1, email: 1 }, { unique: true });

const UserModel = mongoose.model("User", UserSchema);

export { UserModel as User };
