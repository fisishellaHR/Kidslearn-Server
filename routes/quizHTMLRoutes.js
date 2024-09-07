import express from "express";
import QuizHTMLModel from "../models/quizModel.js"; // Model untuk QuizHTMLModel

const router = express.Router();

// Route untuk membuat kuis baru
router.post("/create", async (req, res) => {
  const { title, questions, passGrade } = req.body;
  try {
    const newQuiz = new QuizHTMLModel({
      title,
      questions,
      passGrade,
    });

    await newQuiz.save();
    res
      .status(201)
      .json({ message: "Quiz created successfully", quiz: newQuiz });
  } catch (error) {
    console.error("Error creating quiz:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

// Route untuk mengambil semua kuis
router.get("/all", async (req, res) => {
  try {
    const quizzes = await QuizHTMLModel.find({}, "title questions passGrade");
    res.status(200).json(quizzes);
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Route untuk submit jawaban kuis
router.post("/:quizId/submit", async (req, res) => {
  const { quizId } = req.params;
  const userAnswers = req.body;
  try {
    const quiz = await QuizHTMLModel.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    let score = 0;
    const details = quiz.questions.map((question, index) => {
      const userAnswer = userAnswers[index];
      const correct =
        question.correctAnswer.trim().toLowerCase() ===
        userAnswer.trim().toLowerCase();
      if (correct) score += 1;
      return {
        question: question.question,
        correctAnswer: question.correctAnswer,
        userAnswer: userAnswer,
        correct,
      };
    });

    const percentageScore = (score / quiz.questions.length) * 100;
    const passed = percentageScore >= quiz.passGrade;

    res.status(200).json({
      message: passed
        ? "Congratulations! You passed the quiz."
        : "You didn't pass. Try again.",
      score: percentageScore,
      passed,
      details,
    });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Route untuk mengedit beberapa kuis sekaligus
router.put("/edit-multiple", async (req, res) => {
  const quizzes = req.body; // Expecting an array of quizzes
  try {
    const updatedQuizzes = await Promise.all(
      quizzes.map(async (quiz) => {
        return await QuizHTMLModel.findByIdAndUpdate(
          quiz._id,
          {
            title: quiz.title,
            questions: quiz.questions,
            passGrade: quiz.passGrade,
          },
          { new: true }
        );
      })
    );

    res.status(200).json({
      message: "Quizzes updated successfully",
      quizzes: updatedQuizzes,
    });
  } catch (error) {
    console.error("Error updating quizzes:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Route untuk mendapatkan detail kuis berdasarkan ID
router.get("/quiz/:quizId", async (req, res) => {
  const { quizId } = req.params;
  try {
    const quiz = await QuizHTMLModel.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    res.status(200).json(quiz);
  } catch (error) {
    console.error("Error fetching quiz:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Route untuk menghapus kuis berdasarkan ID
router.delete("/quiz/:quizId", async (req, res) => {
  const { quizId } = req.params;
  try {
    const result = await QuizHTMLModel.findByIdAndDelete(quizId);
    if (!result) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    res.status(200).json({ message: "Quiz deleted successfully" });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
