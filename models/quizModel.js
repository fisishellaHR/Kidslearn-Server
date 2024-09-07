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

const QuizHTMLModel = mongoose.model("QuizHTML", quizSchema);

export default QuizHTMLModel;
