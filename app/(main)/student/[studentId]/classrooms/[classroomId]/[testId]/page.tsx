"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
} from "lucide-react";

type QuestionType =
  | "number-comparison"
  | "digit-dot-matching"
  | "number-series"
  | "single-digit-addition"
  | "single-digit-subtraction"
  | "multi-digit-calculation";

type Question = {
  id: number;
  type: QuestionType;
  prompt: string;
  display?: string;
  choices: string[];
  correctAnswer: string;
};

const testData = {
  "test-examination": {
    title: "Test Examination",
    subtitle: "Mathematical Reasoning",
    instruction: "Read each question carefully and choose the correct answer.",
  },
  "number-system": {
    title: "Number System",
    subtitle: "Mathematical Reasoning",
    instruction: "Answer the following number system questions.",
  },
  "comparison-test": {
    title: "Comparison Test",
    subtitle: "Mathematical Reasoning",
    instruction: "Compare the numbers and choose the correct answer.",
  },
  shapes: {
    title: "Shapes",
    subtitle: "Mathematical Reasoning",
    instruction: "Identify the shapes shown in each item.",
  },
};

const questions: Question[] = [
  {
    id: 1,
    type: "number-comparison",
    prompt: "Which number is bigger?",
    choices: ["4", "7"],
    correctAnswer: "7",
  },
  {
    id: 2,
    type: "number-comparison",
    prompt: "Which number is smaller?",
    choices: ["9", "3"],
    correctAnswer: "3",
  },
  {
    id: 3,
    type: "number-comparison",
    prompt: "Which number is bigger?",
    choices: ["12", "18"],
    correctAnswer: "18",
  },
  {
    id: 4,
    type: "number-comparison",
    prompt: "Which number is smaller?",
    choices: ["21", "16"],
    correctAnswer: "16",
  },
  {
    id: 5,
    type: "digit-dot-matching",
    prompt: "How many dots are shown?",
    display: "● ● ●",
    choices: ["2", "3", "4"],
    correctAnswer: "3",
  },
  {
    id: 6,
    type: "digit-dot-matching",
    prompt: "How many dots are shown?",
    display: "● ● ● ● ●",
    choices: ["4", "5", "6"],
    correctAnswer: "5",
  },
  {
    id: 7,
    type: "digit-dot-matching",
    prompt: "Which number matches the dots?",
    display: "● ● ● ● ● ● ●",
    choices: ["6", "7", "8"],
    correctAnswer: "7",
  },
  {
    id: 8,
    type: "digit-dot-matching",
    prompt: "Which number matches the dots?",
    display: "● ● ● ●",
    choices: ["3", "4", "5"],
    correctAnswer: "4",
  },
  {
    id: 9,
    type: "number-series",
    prompt: "What number comes next?",
    display: "1, 2, 3, 4, ?",
    choices: ["5", "6", "7"],
    correctAnswer: "5",
  },
  {
    id: 10,
    type: "number-series",
    prompt: "What number comes next?",
    display: "2, 4, 6, 8, ?",
    choices: ["9", "10", "12"],
    correctAnswer: "10",
  },
  {
    id: 11,
    type: "number-series",
    prompt: "What number comes next?",
    display: "5, 10, 15, 20, ?",
    choices: ["21", "25", "30"],
    correctAnswer: "25",
  },
  {
    id: 12,
    type: "number-series",
    prompt: "What number is missing?",
    display: "3, 6, ?, 12, 15",
    choices: ["8", "9", "10"],
    correctAnswer: "9",
  },
  {
    id: 13,
    type: "single-digit-addition",
    prompt: "What is the answer?",
    display: "3 + 2 = ?",
    choices: ["4", "5", "6"],
    correctAnswer: "5",
  },
  {
    id: 14,
    type: "single-digit-addition",
    prompt: "What is the answer?",
    display: "6 + 1 = ?",
    choices: ["7", "8", "9"],
    correctAnswer: "7",
  },
  {
    id: 15,
    type: "single-digit-addition",
    prompt: "What is the answer?",
    display: "4 + 5 = ?",
    choices: ["8", "9", "10"],
    correctAnswer: "9",
  },
  {
    id: 16,
    type: "single-digit-subtraction",
    prompt: "What is the answer?",
    display: "8 - 3 = ?",
    choices: ["4", "5", "6"],
    correctAnswer: "5",
  },
  {
    id: 17,
    type: "single-digit-subtraction",
    prompt: "What is the answer?",
    display: "9 - 4 = ?",
    choices: ["5", "6", "7"],
    correctAnswer: "5",
  },
  {
    id: 18,
    type: "single-digit-subtraction",
    prompt: "What is the answer?",
    display: "7 - 2 = ?",
    choices: ["4", "5", "6"],
    correctAnswer: "5",
  },
  {
    id: 19,
    type: "multi-digit-calculation",
    prompt: "What is the answer?",
    display: "12 + 5 = ?",
    choices: ["15", "17", "18"],
    correctAnswer: "17",
  },
  {
    id: 20,
    type: "multi-digit-calculation",
    prompt: "What is the answer?",
    display: "18 - 6 = ?",
    choices: ["10", "12", "14"],
    correctAnswer: "12",
  },
];

function getQuestionTypeLabel(type: QuestionType) {
  if (type === "number-comparison") return "Number Comparison";
  if (type === "digit-dot-matching") return "Digit-Dot Matching";
  if (type === "number-series") return "Number Series";
  if (type === "single-digit-addition") return "Single-Digit Addition";
  if (type === "single-digit-subtraction") return "Single-Digit Subtraction";
  return "Multi-Digit Calculation";
}

function formatElapsedTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function StudentTestPage() {
  const router = useRouter();

  const params = useParams<{
    studentId: string;
    classroomId: string;
    testId: string;
  }>();

  const { studentId, classroomId, testId } = params;

  const test =
    testData[testId as keyof typeof testData] ?? testData["test-examination"];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const currentQuestion = questions[currentIndex];
  const selectedAnswer = answers[currentQuestion.id];

  const isFirstQuestion = currentIndex === 0;
  const isLastQuestion = currentIndex === questions.length - 1;

  const answeredCount = useMemo(() => {
    return Object.keys(answers).length;
  }, [answers]);

  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!submitted) {
        event.preventDefault();
        event.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [submitted]);

  const handleBackToLearningPath = () => {
    if (!submitted) {
      const confirmQuit = window.confirm(
        "Are you sure you want to quit? Your answers have not been submitted yet."
      );

      if (!confirmQuit) return;
    }

    router.push(`/student/${studentId}/classrooms/${classroomId}`);
  };

  const handleSelectAnswer = (choice: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: choice,
    }));
  };

  const handlePrevious = () => {
    if (!isFirstQuestion) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (!isLastQuestion) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleSubmit = () => {
    const correctCount = questions.filter(
      (question) => answers[question.id] === question.correctAnswer
    ).length;

    const unansweredCount = questions.length - answeredCount;

    const resultData = {
      testId,
      totalItems: questions.length,
      answeredCount,
      correctCount,
      wrongCount: questions.length - correctCount - unansweredCount,
      unansweredCount,
      elapsedSeconds,
      elapsedTime: formatElapsedTime(elapsedSeconds),
      answers,
    };

    localStorage.setItem("studentTestResult", JSON.stringify(resultData));

    setSubmitted(true);

    router.push(
      `/student/${studentId}/classrooms/${classroomId}/${testId}/result`
    );
  };

  return (
    <main className="h-full w-full overflow-hidden bg-[#F7F7F7]">
      <section className="flex h-full w-full flex-col overflow-hidden">
        {/* Top Navigation */}
        <div className="flex shrink-0 items-center justify-between px-6 pt-8">
          <button
            type="button"
            onClick={handleBackToLearningPath}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#9A9A9A] transition hover:text-[#555]"
          >
            <ArrowLeft size={18} />
            Back to Learning Path
          </button>

          <div className="mr-10 flex items-center gap-2 px-5 py-2 pr-7 text-sm font-semibold text-[#9A9A9A]">
            <Clock3 size={16} />
            {formatElapsedTime(elapsedSeconds)}
          </div>
        </div>

        {/* Header */}
        <section className="flex w-full shrink-0 items-center px-6 py-6">
          <div className="flex w-full items-end justify-between gap-5 px-7">
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-4">
                <h1 className="text-4xl font-bold leading-none text-[#9D9D9D]">
                  {test.title}
                </h1>

                <p className="text-lg font-semibold leading-none text-[#29A177]">
                  {test.subtitle}
                </p>
              </div>

              <p className="max-w-3xl text-lg text-[#666]">
                {test.instruction}
              </p>
            </div>

            <div className="hidden px-6 py-0 md:flex md:flex-col md:items-center md:justify-center">
              <p className="text-base font-bold uppercase tracking-wide text-[#B8B8B8]">
                Progress
              </p>
              <p className="mt-1 text-4xl font-bold text-[#9D9D9D]">
                {currentIndex + 1} / {questions.length}
              </p>
            </div>
          </div>
        </section>

        {/* Test Body */}
        <section className="flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-white">
          {/* Progress Bar */}
          <div className="h-2 w-full shrink-0 bg-[#EFEFEF]">
            <div
              className="h-full bg-[#29A177] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Question Area */}
          <div className="flex min-h-0 flex-1 items-center justify-center px-6 py-6">
            <div className="grid w-full max-w-6xl grid-cols-[80px_1fr_80px] items-center gap-6">
              {/* Previous */}
              <button
                type="button"
                onClick={handlePrevious}
                disabled={isFirstQuestion}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F2F2F2] text-[#B5B5B5] transition hover:bg-[#E8E8E8] hover:text-[#777] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={36} />
              </button>

              {/* Question Card */}
              <div className="border border-[#E9E9E9] bg-[#FAFAFA] px-10 py-10 shadow-[0_18px_50px_rgba(0,0,0,0.04)]">
                <div className="flex items-center justify-between gap-5">
                  <div>
                    <p className="text-base font-bold uppercase tracking-wide text-[#BDBDBD]">
                      Question #{currentQuestion.id}
                    </p>

                    <p className="mt-1 text-lg font-semibold text-[#29A177]">
                      {getQuestionTypeLabel(currentQuestion.type)}
                    </p>
                  </div>

                  <div
                    className={`rounded-full px-4 py-1 text-sm font-bold ${
                      selectedAnswer
                        ? "bg-[#DFF5EC] text-[#29A177]"
                        : "bg-[#F2F2F2] text-[#AAAAAA]"
                    }`}
                  >
                    {selectedAnswer ? "Answered" : "Not answered"}
                  </div>
                </div>

                <h2 className="mt-7 text-center text-4xl font-bold leading-tight text-[#666]">
                  {currentQuestion.prompt}
                </h2>

                {currentQuestion.display && (
                  <div className="mt-8 text-center text-5xl font-extrabold tracking-wide text-[#555]">
                    {currentQuestion.display}
                  </div>
                )}

                <div className="mt-10 grid gap-5 sm:grid-cols-2">
                  {currentQuestion.choices.map((choice) => {
                    const isSelected = selectedAnswer === choice;

                    return (
                      <button
                        key={choice}
                        type="button"
                        onClick={() => handleSelectAnswer(choice)}
                        className={`flex h-20 items-center justify-center rounded-2xl border text-4xl font-bold transition-colors duration-300 ${
                          isSelected
                            ? "border-[#29A177] bg-[#DFF5EC] text-[#29A177]"
                            : "border-[#E5E5E5] bg-white text-[#777] hover:border-[#29A177] hover:bg-[#DFF5EC] hover:text-[#29A177]"
                        }`}
                      >
                        {choice}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Next */}
              <button
                type="button"
                onClick={handleNext}
                disabled={isLastQuestion}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F2F2F2] text-[#B5B5B5] transition hover:bg-[#E8E8E8] hover:text-[#777] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={36} />
              </button>
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="flex shrink-0 items-center justify-between border-t border-[#E5E5E5] px-[60px] py-4">
            <div className="flex items-center gap-2">
              {questions.map((question, index) => {
                const isCurrent = index === currentIndex;
                const isAnswered = !!answers[question.id];

                return (
                  <button
                    key={question.id}
                    type="button"
                    onClick={() => setCurrentIndex(index)}
                    className={`
                      relative flex h-4 w-4 items-center justify-center rounded-full
                      transition-all duration-300 ease-out
                      ${
                        isCurrent
                          ? "scale-110 bg-[#29A177] shadow-[0_0_0_4px_rgba(41,161,119,0.16)]"
                          : isAnswered
                          ? "bg-[#FFCC00] shadow-[0_4px_10px_rgba(255,204,0,0.25)]"
                          : "bg-[#D9D9D9]"
                      }
                    `}
                    aria-label={`Go to question ${index + 1}`}
                  >
                    <Check
                      size={10}
                      strokeWidth={3}
                      className={`
                        text-white transition-all duration-300 ease-out
                        ${
                          isAnswered
                            ? "scale-100 opacity-100"
                            : "scale-0 opacity-0"
                        }
                      `}
                    />
                  </button>
                );
              })}
            </div>

            {isLastQuestion ? (
              <button
                type="button"
                onClick={handleSubmit}
                className="flex h-11 min-w-[150px] items-center justify-center rounded-md bg-[#29A177] px-10 text-lg font-bold text-white transition-colors duration-300 hover:bg-[#FFCC00] active:bg-[#EAB300]"
              >
                Submit
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="flex h-11 min-w-[150px] items-center justify-center rounded-md bg-[#29A177] px-10 text-lg font-bold text-white transition-colors duration-300 hover:bg-[#FFCC00] active:bg-[#EAB300]"
              >
                Next
              </button>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}