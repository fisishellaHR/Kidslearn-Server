import express from "express";
import QuizCSSModel from "../models/quizduaModel.js"; // Model untuk QuizCSSModel

const router = express.Router();

// Route untuk membuat kuis baru
router.post("/create", async (req, res) => {
  const { title, questions, passGrade } = req.body;
  try {
    const newQuiz = new QuizCSSModel({
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
    const quizzes = await QuizCSSModel.find({}, "title questions passGrade");
    res.status(200).json(quizzes);
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/allScores", async (req, res) => {
  try {
    const scores = await ScoreQuizModel.find({}, "title questions passGrade");
    res.status(200).json(scores);
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
router.post("/:quizId/submit", async (req, res) => {
  const { email, quizId, userAnswers } = req.body;

  try {
    const user = await User.findOne({ email });
    const quiz = await QuizCSSModel.findOne({ _id: quizId });

    if (!quiz) {
      return res.status(404).json({ message: "Quiz Not Found!" });
    }
    if (!user) {
      return res.status(404).json({ message: "User Not Found!" });
    }

    let scoreUser = await ScoreQuizModel.findOne({
      user: user._id,
      quiz: quizId,
    });

    if (!scoreUser) {
      scoreUser = new ScoreQuizModel({
        user: user._id,
        quiz: quizId,
        answers: [],
      });
    }

    let score = 0;
    const details = quiz.questions.map((question, index) => {
      const userAnswerObject = userAnswers.find(
        (ans) => ans.questionIndex === index
      );
      const user_answer = (userAnswerObject?.answer || "").toString();
      const correct =
        question.correctAnswer.trim().toLowerCase() ===
        user_answer.trim().toLowerCase();
      if (correct) score += 1;
      return {
        question: question.question,
        correctAnswer: question.correctAnswer,
        userAnswer: user_answer,
        correct,
      };
    });

    const percentageScore = (score / quiz.questions.length) * 100;
    const passed = percentageScore >= quiz.passGrade;

    scoreUser.answers = userAnswers.map((answerObj) => ({
      questionId: quiz.questions[answerObj.questionIndex]._id,
      answer: answerObj.answer,
    }));
    scoreUser.experiment = scoreUser.experiment ? scoreUser.experiment + 1 : 1;
    scoreUser.score = percentageScore;

    await scoreUser.save();

    res.status(200).json({
      message: passed
        ? `Congratulations ${user.username}! You passed the quiz.`
        : "You didn't pass. Try again.",
      score: percentageScore,
      experiment: scoreUser.experiment,
      passed,
      details,
      user: user.email,
      username: user.username,
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
        return await QuizCSSModel.findByIdAndUpdate(
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
router.get("/:quizId", async (req, res) => {
  const { quizId } = req.params;
  try {
    const quiz = await QuizCSSModel.findById({ _id: quizId });
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    res.status(200).json(quiz);
  } catch (error) {
    console.error("Error fetching quiz:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/one/quiz", async (req, res) => {
  try {
    const quizId = await QuizCSSModel.findOne();

    if (!quizId) {
      res.status(404).json({ message: "Empty Quiz Module!" });
    }
    res.status(200).json(quizId);
  } catch (error) {
    res.status(500).json({ ErrorMessage: error.message });
  }
});

// Route untuk menghapus kuis berdasarkan ID
router.delete("/quiz/:quizId", async (req, res) => {
  const { quizId } = req.params;
  try {
    const result = await QuizCSSModel.findByIdAndDelete(quizId);
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
