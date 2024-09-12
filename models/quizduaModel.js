import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
  title: { type: String },
  questions: [
    {
      question: String,
      options: [String],
      correctAnswer: String,
    },
  ],
  passGrade: Number,
});

const QuizCSSModel = mongoose.model("QuizCSS", quizSchema);

export default QuizCSSModel;
