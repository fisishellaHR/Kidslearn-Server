import mongoose from "mongoose";

const ModulesSchema = new mongoose.Schema({
  judul: { type: String, required: true, unique: true },
  link: { type: String, required: true },
  desc: { type: String, required: true },
});

const ModulesModel = mongoose.model("ModulesCSS", ModulesSchema);

ModulesModel.init()
  .then(() => {
    console.log("index created");
  })
  .catch((err) => console.log("Error creating Index : ", err));

export { ModulesModel as ModulesCSS };
