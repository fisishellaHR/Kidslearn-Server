import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
  title: String,
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
