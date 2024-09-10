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
  passGrade: { type: Number },
});

const QuizHTMLModel = mongoose.model("QuizHTML", quizSchema);

export default QuizHTMLModel;
