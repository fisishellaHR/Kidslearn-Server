import mongoose, { mongo } from "mongoose";
// import QuizHTMLModel from "./quizModel";

const Schema = mongoose.Schema;

const ScoreQuiz = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    // ref: "QuizHTML",
    // ref: "QuizCSS",
    refPath: 'quizModel',
    required: true,
  },
  quizModel: { type: String, enum: ['QuizHTML', 'QuizCSS'] },
  passGrade: { type: Boolean },
  answers: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
      answer: { type: String, required: true },
    },
  ],
  experiment: { type: Number },
  score: { type: Number },
});

const ScoreQuizModel = mongoose.model("ScoreQuizModel", ScoreQuiz);

export default ScoreQuizModel;
