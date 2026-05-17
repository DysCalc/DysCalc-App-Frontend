"use client";

import { useState } from "react";
import {
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  Cog6ToothIcon,
  EyeIcon,
  PencilSquareIcon,
  RocketLaunchIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import type { Classification } from "@/types";

type BuilderStep = "settings" | "questions" | "approval" | "preview" | "deploy";

type QuestionType =
  | "number-comparison"
  | "digit-dot-matching"
  | "number-series"
  | "single-digit-addition"
  | "single-digit-subtraction"
  | "multi-digit-calculation";

type GenerationQuestionType = QuestionType | "random";

type GeneratedQuestion = {
  id: number;
  type: QuestionType;
  prompt: string;
  display?: string;
  choices: string[];
  correctAnswer: string;
  approved: boolean;
};

type ScoreRow = {
  key: string;
  label: string;
  score: number | null;
};

type Props = {
  student: {
    id: string;
    name: string;
  };
  classroom: {
    id: string;
    name: string;
    student_count: number;
    variant: "yellow" | "green" | "blue" | "gray";
  };
  classId: string;
  studentId: string;
  screening: {
    classification: Classification | null;
    created_at: string | null;
    scores: ScoreRow[];
    averageScore: number | null;
  };
};

const steps = [
  {
    id: "settings" as BuilderStep,
    label: "Generation Settings",
    description: "Set coverage, item count, and difficulty.",
    icon: Cog6ToothIcon,
  },
  {
    id: "questions" as BuilderStep,
    label: "Generated Questions",
    description: "Edit prompts, choices, and answers.",
    icon: PencilSquareIcon,
  },
  {
    id: "approval" as BuilderStep,
    label: "Review & Approval",
    description: "Approve generated items before publishing.",
    icon: ClipboardDocumentCheckIcon,
  },
  {
    id: "preview" as BuilderStep,
    label: "Preview",
    description: "See the student-facing test view.",
    icon: EyeIcon,
  },
  {
    id: "deploy" as BuilderStep,
    label: "Deploy",
    description: "Formally assign this assessment to the student.",
    icon: RocketLaunchIcon,
  },
];

const questionTypes: GenerationQuestionType[] = [
  "random",
  "number-comparison",
  "digit-dot-matching",
  "number-series",
  "single-digit-addition",
  "single-digit-subtraction",
  "multi-digit-calculation",
];

const initialQuestions: GeneratedQuestion[] = [
  {
    id: 1,
    type: "number-comparison",
    prompt: "Which number is bigger?",
    display: "",
    choices: ["4", "5", "6", "7"],
    correctAnswer: "7",
    approved: false,
  },
  {
    id: 2,
    type: "digit-dot-matching",
    prompt: "How many dots are shown?",
    display: "● ● ● ● ●",
    choices: ["4", "5", "6", "7"],
    correctAnswer: "5",
    approved: false,
  },
  {
    id: 3,
    type: "single-digit-addition",
    prompt: "What is the answer?",
    display: "3 + 2 = ?",
    choices: ["4", "5", "6", "7"],
    correctAnswer: "5",
    approved: false,
  },
];

function getQuestionTypeLabel(type: GenerationQuestionType) {
  if (type === "random") return "Random";
  if (type === "number-comparison") return "Number Comparison";
  if (type === "digit-dot-matching") return "Digit-Dot Matching";
  if (type === "number-series") return "Number Series";
  if (type === "single-digit-addition") return "Single-Digit Addition";
  if (type === "single-digit-subtraction") return "Single-Digit Subtraction";
  return "Multi-Digit Calculation";
}

function buildMockQuestion(id: number, type: QuestionType): GeneratedQuestion {
  if (type === "number-comparison") {
    return {
      id,
      type,
      prompt: "Which number is bigger?",
      display: "",
      choices: ["4", "5", "6", "7"],
      correctAnswer: "7",
      approved: false,
    };
  }

  if (type === "digit-dot-matching") {
    return {
      id,
      type,
      prompt: "How many dots are shown?",
      display: "● ● ● ● ●",
      choices: ["4", "5", "6", "7"],
      correctAnswer: "5",
      approved: false,
    };
  }

  if (type === "number-series") {
    return {
      id,
      type,
      prompt: "What number comes next?",
      display: "2, 4, 6, 8, ?",
      choices: ["9", "10", "11", "12"],
      correctAnswer: "10",
      approved: false,
    };
  }

  if (type === "single-digit-addition") {
    return {
      id,
      type,
      prompt: "What is the answer?",
      display: "3 + 2 = ?",
      choices: ["4", "5", "6", "7"],
      correctAnswer: "5",
      approved: false,
    };
  }

  if (type === "single-digit-subtraction") {
    return {
      id,
      type,
      prompt: "What is the answer?",
      display: "8 - 3 = ?",
      choices: ["3", "4", "5", "6"],
      correctAnswer: "5",
      approved: false,
    };
  }

  return {
    id,
    type,
    prompt: "What is the answer?",
    display: "12 + 5 = ?",
    choices: ["15", "16", "17", "18"],
    correctAnswer: "17",
    approved: false,
  };
}

function QuestionNumberBoxes({
  questions,
  selectedQuestionId,
  onSelectQuestion,
}: {
  questions: GeneratedQuestion[];
  selectedQuestionId: number;
  onSelectQuestion: (questionId: number) => void;
}) {
  return (
    <div className="">
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-20">
        {questions.map((question) => {
          const isActive = question.id === selectedQuestionId;

          return (
            <button
              key={question.id}
              type="button"
              onClick={() => onSelectQuestion(question.id)}
              className={`flex h-10 items-center justify-center border text-sm font-extrabold transition-all duration-300 ${
                question.approved
                  ? "border-[#FFCC00] bg-[#FFCC00] text-white hover:bg-[#EAB300]"
                  : "border-[#E4E4E4] bg-white text-[#777] hover:border-[#29A177] hover:text-[#29A177]"
              } ${
                isActive
                  ? "ring-2 ring-[#29A177] ring-offset-2"
                  : "ring-0 ring-transparent"
              }`}
            >
              {question.id}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function LearningPath({
  student,
  classroom,
  classId,
  studentId,
  screening,
}: Props) {
  const [activeStep, setActiveStep] = useState<BuilderStep>("settings");
  const [selectedQuestionId, setSelectedQuestionId] = useState(1);

  const [selectedType, setSelectedType] =
    useState<GenerationQuestionType>("random");

  const [itemCount, setItemCount] = useState(20);
  const [difficulty, setDifficulty] = useState("Beginner");

  const [questions, setQuestions] =
    useState<GeneratedQuestion[]>(initialQuestions);

  const [isDeployed, setIsDeployed] = useState(false);
  const [deployedAt, setDeployedAt] = useState<string | null>(null);

  const selectedQuestion =
    questions.find((question) => question.id === selectedQuestionId) ??
    questions[0];

  const approvedCount = questions.filter((question) => question.approved).length;
  const isReadyToDeploy =
    questions.length > 0 && approvedCount === questions.length;

  const updateQuestion = (
    questionId: number,
    updates: Partial<GeneratedQuestion>
  ) => {
    setQuestions((prev) =>
      prev.map((question) =>
        question.id === questionId ? { ...question, ...updates } : question
      )
    );

    setIsDeployed(false);
    setDeployedAt(null);
  };

  const handleGenerate = () => {
    const actualQuestionTypes = questionTypes.filter(
      (type): type is QuestionType => type !== "random"
    );

    const generatedQuestions: GeneratedQuestion[] = Array.from(
      { length: itemCount },
      (_, index) => {
        const id = index + 1;

        const type: QuestionType =
          selectedType === "random"
            ? actualQuestionTypes[index % actualQuestionTypes.length]
            : selectedType;

        return buildMockQuestion(id, type);
      }
    );

    setQuestions(generatedQuestions);
    setSelectedQuestionId(generatedQuestions[0]?.id ?? 1);
    setIsDeployed(false);
    setDeployedAt(null);
    setActiveStep("questions");
  };

  const handleDeploy = () => {
    if (!isReadyToDeploy || isDeployed) return;

    setIsDeployed(true);
    setDeployedAt(new Date().toLocaleString());
  };

  return (
    <main className="h-full w-full overflow-y-auto bg-[#F7F7F7] px-8 py-4">
      <section className="flex min-h-full w-full flex-col">
        {/* Header */}
        <div className="shrink-0 border-t border-l border-r border-[#E7E7E7] bg-white px-8 py-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#29A177]">
              Assessment Builder
            </p>

            <h1 className="mt-2 text-4xl font-extrabold leading-none text-[#5C5E64]">
              Generate Test Questions
            </h1>

            <p className="max-w-3xl text-base leading-7 text-[#8A8A8A]">
              Create, edit, approve, and preview DysCalc-aligned assessment
              questions before assigning them to students.
            </p>
          </div>
        </div>

        {/* Builder Body */}
        <div className="grid min-h-[620px] flex-1 grid-cols-[320px_1fr] overflow-hidden border border-[#E7E7E7] bg-white">
          {/* Sidebar */}
          <aside className="max-h-[calc(100vh-220px)] overflow-y-auto border-r border-[#E7E7E7] bg-[#FAFAFA] py-6">
            <p className="mb-5 px-5 text-xs font-bold uppercase tracking-wide text-[#BDBDBD]">
              Builder Steps
            </p>

            <div className="border-t border-[#E7E7E7]">
              {steps.map((step) => {
                const Icon = step.icon;
                const isActive = activeStep === step.id;

                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setActiveStep(step.id)}
                    className={`flex w-full items-start gap-4 border-b border-[#E7E7E7] px-5 py-4 text-left transition-colors duration-300 ${
                      isActive
                        ? "bg-[#ECF9F4] text-[#29A177]"
                        : "bg-[#FAFAFA] text-[#8A8A8A] hover:bg-white hover:text-[#5C5E64]"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors duration-300 ${
                        isActive
                          ? "bg-[#29A177] text-white"
                          : "bg-[#EFEFEF] text-[#9A9A9A]"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <p
                        className={`text-lg font-extrabold leading-none ${
                          isActive ? "text-[#29A177]" : "text-[#6F6F6F]"
                        }`}
                      >
                        {step.label}
                      </p>

                      <p className="mt-1 text-xs font-normal leading-5 text-[#A0A0A0]">
                        {step.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mx-5 mt-6 grid gap-3">
              <div className="border border-[#E7E7E7] bg-white px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-[#BDBDBD]">
                  Approval Status
                </p>

                <div className="mt-1 flex items-end justify-between gap-3">
                  <p className="text-xl font-extrabold leading-none text-[#29A177]">
                    {approvedCount}/{questions.length}
                  </p>

                  <p className="text-xs font-medium text-[#9A9A9A]">
                    Approved
                  </p>
                </div>
              </div>

              <div className="border border-[#E7E7E7] bg-white px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-[#BDBDBD]">
                  Deployment Status
                </p>

                <div className="mt-1 flex items-end justify-between gap-3">
                  <p
                    className={`text-lg font-extrabold leading-none ${
                      isDeployed
                        ? "text-[#FFCC00]"
                        : isReadyToDeploy
                        ? "text-[#29A177]"
                        : "text-[#9A9A9A]"
                    }`}
                  >
                    {isDeployed ? "Deployed" : isReadyToDeploy ? "Ready" : "Not Ready"}
                  </p>

                  <p className="text-xs font-medium text-[#9A9A9A]">
                    Assignment
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <section className="max-h-[calc(100vh-220px)] overflow-y-auto bg-white px-8 py-8">
            {activeStep === "settings" && (
              <div className="max-w-5xl">
                <h2 className="text-3xl font-extrabold text-[#696969]">
                  Generation Settings
                </h2>

                <p className="mt-2 text-base leading-7 text-[#9A9A9A]">
                  Configure how the LLM should generate questions for this
                  assessment.
                </p>

                <div className="mt-8 grid gap-6 md:grid-cols-3">
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-bold text-[#777]">
                      Question Type
                    </span>

                    <select
                      value={selectedType}
                      onChange={(event) =>
                        setSelectedType(
                          event.target.value as GenerationQuestionType
                        )
                      }
                      className="h-12 rounded-xl border border-[#E4E4E4] bg-white px-4 text-sm font-medium text-[#777] outline-none transition focus:border-[#29A177]"
                    >
                      {questionTypes.map((type) => (
                        <option key={type} value={type}>
                          {getQuestionTypeLabel(type)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-bold text-[#777]">
                      Number of Items
                    </span>

                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={itemCount}
                      onChange={(event) =>
                        setItemCount(Number(event.target.value))
                      }
                      className="h-12 rounded-xl border border-[#E4E4E4] bg-white px-4 text-sm font-medium text-[#777] outline-none transition focus:border-[#29A177]"
                    />
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-bold text-[#777]">
                      Difficulty
                    </span>

                    <select
                      value={difficulty}
                      onChange={(event) => setDifficulty(event.target.value)}
                      className="h-12 rounded-xl border border-[#E4E4E4] bg-white px-4 text-sm font-medium text-[#777] outline-none transition focus:border-[#29A177]"
                    >
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                    </select>
                  </label>
                </div>

                <div className="mt-8 bg-[#F7F7F7] px-6 py-5">
                  <p className="text-sm font-bold text-[#777]">
                    LLM Prompt Direction
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[#9A9A9A]">
                    Generate child-friendly math questions for dyscalculia
                    screening. Keep the language simple, use short choices, and
                    align items with number comparison, dot matching, number
                    series, addition, and subtraction coverage.
                  </p>

                  <div className="mt-5 rounded-xl bg-white px-5 py-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-[#BDBDBD]">
                      Current Generation Request
                    </p>

                    <p className="mt-2 text-sm font-medium text-[#777]">
                      Generate{" "}
                      <span className="font-extrabold text-[#29A177]">
                        {itemCount}
                      </span>{" "}
                      question{itemCount === 1 ? "" : "s"} using{" "}
                      <span className="font-extrabold text-[#29A177]">
                        {getQuestionTypeLabel(selectedType)}
                      </span>{" "}
                      coverage at{" "}
                      <span className="font-extrabold text-[#29A177]">
                        {difficulty}
                      </span>{" "}
                      difficulty.
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    type="button"
                    onClick={handleGenerate}
                    className="flex h-12 min-w-[190px] items-center justify-center gap-2 rounded-xl bg-[#29A177] px-7 text-base font-bold text-white transition-colors duration-300 hover:bg-[#FFCC00] active:bg-[#EAB300]"
                  >
                    <SparklesIcon className="h-5 w-5" />
                    Generate Questions
                  </button>
                </div>
              </div>
            )}

            {activeStep === "questions" && selectedQuestion && (
            <div>
              <div className="flex items-start justify-between gap-0">
                <div>
                  <h2 className="text-3xl font-extrabold text-[#696969]">
                    Generated Questions
                  </h2>

                  <p className="mt-2 text-base leading-7 text-[#9A9A9A]">
                    Edit the generated prompt, visual display, choices, and correct answer
                    before approval.
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <QuestionNumberBoxes
                  questions={questions}
                  selectedQuestionId={selectedQuestion.id}
                  onSelectQuestion={setSelectedQuestionId}
                />
              </div>

              <div className="mt-6 border border-[#E7E7E7] px-6 py-6">
                <div className="mb-6 flex items-center justify-between gap-4 border-b border-[#EFEFEF] pb-2">
                  <div>
                    <p className="text-lg font-extrabold text-[#696969]">
                      Question #{selectedQuestion.id}
                    </p>
                    <p className="mt-1 text-sm font-medium text-[#9A9A9A]">
                      {getQuestionTypeLabel(selectedQuestion.type)}
                    </p>
                  </div>

                  {selectedQuestion.approved && (
                    <div className="flex items-center gap-2 rounded-full bg-[#FFCC00] px-4 py-2 text-sm font-extrabold text-white">
                      <CheckCircleIcon className="h-5 w-5" />
                      Approved
                    </div>
                  )}
                </div>

                <div className="grid gap-5">
                  {/* Prompt + Display one line */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-bold text-[#777]">Prompt</span>

                      <input
                        value={selectedQuestion.prompt}
                        onChange={(event) =>
                          updateQuestion(selectedQuestion.id, {
                            prompt: event.target.value,
                          })
                        }
                        className="h-12 rounded-xl border border-[#E4E4E4] px-4 text-sm font-medium text-[#777] outline-none transition focus:border-[#29A177]"
                      />
                    </label>

                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-bold text-[#777]">
                        Display / Illustration
                      </span>

                      <input
                        value={selectedQuestion.display ?? ""}
                        onChange={(event) =>
                          updateQuestion(selectedQuestion.id, {
                            display: event.target.value,
                          })
                        }
                        placeholder="Example: ● ● ●"
                        className="h-12 rounded-xl border border-[#E4E4E4] px-4 text-sm font-medium text-[#777] outline-none transition focus:border-[#29A177]"
                      />
                    </label>
                  </div>

                  {/* 4 choices one line */}
                  <div className="grid gap-4 md:grid-cols-4">
                    {[0, 1, 2, 3].map((index) => (
                      <label key={index} className="flex flex-col gap-2">
                        <span className="text-sm font-bold text-[#777]">
                          Choice {index + 1}
                        </span>

                        <input
                          value={selectedQuestion.choices[index] ?? ""}
                          onChange={(event) => {
                            const updatedChoices = [...selectedQuestion.choices];

                            while (updatedChoices.length < 4) {
                              updatedChoices.push("");
                            }

                            updatedChoices[index] = event.target.value;

                            updateQuestion(selectedQuestion.id, {
                              choices: updatedChoices.slice(0, 4),
                            });
                          }}
                          className="h-12 rounded-xl border border-[#E4E4E4] px-4 text-sm font-medium text-[#777] outline-none transition focus:border-[#29A177]"
                        />
                      </label>
                    ))}
                  </div>

                  {/* Answer one line */}
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-bold text-[#777]">Correct Answer</span>

                    <input
                      value={selectedQuestion.correctAnswer}
                      onChange={(event) =>
                        updateQuestion(selectedQuestion.id, {
                          correctAnswer: event.target.value,
                        })
                      }
                      className="h-12 rounded-xl border border-[#E4E4E4] px-4 text-sm font-medium text-[#777] outline-none transition focus:border-[#29A177]"
                    />
                  </label>
                </div>
              </div>
            </div>
            )}

            {activeStep === "approval" && selectedQuestion && (
              <div>
                <h2 className="text-3xl font-extrabold text-[#696969]">
                  Review & Approval
                </h2>

                <p className="mt-2 text-base leading-7 text-[#9A9A9A]">
                  Approve questions that are ready to be assigned to students.
                </p>

                <div className="mt-4">
                  <QuestionNumberBoxes
                    questions={questions}
                    selectedQuestionId={selectedQuestion.id}
                    onSelectQuestion={setSelectedQuestionId}
                  />
                </div>

                <div className="mt-6 border border-[#E7E7E7] px-6 py-6">
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <p className="text-lg font-extrabold text-[#696969]">
                        Question #{selectedQuestion.id}
                      </p>

                      <p className="mt-1 text-sm font-semibold text-[#29A177]">
                        {getQuestionTypeLabel(selectedQuestion.type)}
                      </p>

                      <p className="mt-4 text-base font-bold text-[#696969]">
                        {selectedQuestion.prompt}
                      </p>

                      {selectedQuestion.display && (
                        <p className="mt-4 rounded-xl bg-[#FAFAFA] px-5 py-4 text-3xl font-extrabold tracking-wide text-[#555]">
                          {selectedQuestion.display}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        updateQuestion(selectedQuestion.id, {
                          approved: !selectedQuestion.approved,
                        })
                      }
                      className={`flex h-11 min-w-[140px] items-center justify-center rounded-xl px-5 text-sm font-bold transition-colors ${
                        selectedQuestion.approved
                          ? "bg-[#FFCC00] text-white hover:bg-[#EAB300]"
                          : "bg-[#29A177] text-white hover:bg-[#FFCC00]"
                      }`}
                    >
                      {selectedQuestion.approved ? "Approved" : "Approve"}
                    </button>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-4">
                    {[0, 1, 2, 3].map((index) => {
                      const choice = selectedQuestion.choices[index] ?? "";

                      return (
                        <div
                          key={index}
                          className={`rounded-xl border px-5 py-4 text-center text-xl font-extrabold ${
                            choice === selectedQuestion.correctAnswer
                              ? "border-[#29A177] bg-[#ECF9F4] text-[#29A177]"
                              : "border-[#E7E7E7] bg-white text-[#777]"
                          }`}
                        >
                          {choice || `Choice ${index + 1}`}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 rounded-xl bg-[#FAFAFA] px-5 py-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-[#BDBDBD]">
                      Correct Answer
                    </p>
                    <p className="mt-1 text-lg font-extrabold text-[#29A177]">
                      {selectedQuestion.correctAnswer}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeStep === "preview" && selectedQuestion && (
              <div>
                <h2 className="text-3xl font-extrabold text-[#696969]">
                  Student Preview
                </h2>

                <p className="mt-2 text-base leading-7 text-[#9A9A9A]">
                  Preview how students will see the selected question.
                </p>

                <div className="mt-4 flex items-center justify-center rounded-2xl bg-[#FAFAFA] px-8 py-10">
                  <div className="w-full max-w-3xl border border-[#E9E9E9] bg-white px-10 py-5 shadow-[0_18px_50px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center justify-between gap-5">
                      <div>
                        <p className="text-base font-bold uppercase tracking-wide text-[#BDBDBD]">
                          Question #{selectedQuestion.id}
                        </p>

                        <p className="mt-1 text-lg font-semibold text-[#29A177]">
                          {getQuestionTypeLabel(selectedQuestion.type)}
                        </p>
                      </div>

                      <div className="rounded-full bg-[#DFF5EC] px-4 py-1 text-sm font-bold text-[#29A177]">
                        Preview
                      </div>
                    </div>

                    <h2 className="mt-7 text-center text-4xl font-bold leading-tight text-[#666]">
                      {selectedQuestion.prompt}
                    </h2>

                    {selectedQuestion.display && (
                      <div className="mt-8 text-center text-5xl font-extrabold tracking-wide text-[#555]">
                        {selectedQuestion.display}
                      </div>
                    )}

                    <div className="mt-10 grid gap-5 sm:grid-cols-4">
                      {[0, 1, 2, 3].map((index) => {
                        const choice = selectedQuestion.choices[index] ?? "";

                        return (
                          <div
                            key={index}
                            className="flex h-20 items-center justify-center rounded-2xl border border-[#E5E5E5] bg-white text-4xl font-bold text-[#777]"
                          >
                            {choice}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeStep === "deploy" && (
              <div>
                <h2 className="text-3xl font-extrabold text-[#696969]">
                  Deploy Assessment
                </h2>

                <p className="mt-2 text-base leading-7 text-[#9A9A9A]">
                  Formally assign this approved assessment to the selected
                  student.
                </p>

                <div className="mt-4 grid gap-2 lg:grid-cols-[1fr_360px]">
                  <div className="border border-[#E7E7E7] bg-white px-6 py-6">
                    <p className="text-sm font-bold uppercase tracking-wide text-[#BDBDBD]">
                      Deployment Summary
                    </p>

                    <div className="mt-3 grid gap-2">
                      <div className="flex items-center justify-between border-b border-[#EFEFEF] pb-2">
                        <span className="text-sm font-bold text-[#777]">
                          Student
                        </span>
                        <span className="text-sm font-extrabold text-[#696969]">
                          {student.name}
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-b border-[#EFEFEF] pb-2">
                        <span className="text-sm font-bold text-[#777]">
                          Student ID
                        </span>
                        <span className="text-sm font-extrabold text-[#696969]">
                          {studentId}
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-b border-[#EFEFEF] pb-2">
                        <span className="text-sm font-bold text-[#777]">
                          Classroom
                        </span>
                        <span className="text-sm font-extrabold text-[#696969]">
                          {classroom.name}
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-b border-[#EFEFEF] pb-2">
                        <span className="text-sm font-bold text-[#777]">
                          Class ID
                        </span>
                        <span className="text-sm font-extrabold text-[#696969]">
                          {classId}
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-b border-[#EFEFEF] pb-2">
                        <span className="text-sm font-bold text-[#777]">
                          Screening Classification
                        </span>
                        <span className="text-sm font-extrabold text-[#696969]">
                          {screening.classification ?? "Not Available"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-b border-[#EFEFEF] pb-2">
                        <span className="text-sm font-bold text-[#777]">
                          Total Questions
                        </span>
                        <span className="text-sm font-extrabold text-[#696969]">
                          {questions.length}
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-b border-[#EFEFEF] pb-2">
                        <span className="text-sm font-bold text-[#777]">
                          Approved Questions
                        </span>
                        <span className="text-sm font-extrabold text-[#29A177]">
                          {approvedCount}/{questions.length}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-[#777]">
                          Status
                        </span>

                        <span
                          className={`rounded-full px-4 py-1 text-sm font-extrabold ${
                            isDeployed
                              ? "bg-[#FFCC00] text-white"
                              : isReadyToDeploy
                              ? "bg-[#DFF5EC] text-[#29A177]"
                              : "bg-[#F3F3F3] text-[#999]"
                          }`}
                        >
                          {isDeployed
                            ? "Deployed"
                            : isReadyToDeploy
                            ? "Ready to Deploy"
                            : "Not Ready"}
                        </span>
                      </div>
                    </div>

                    {deployedAt && (
                      <div className="mt-6 rounded-xl bg-[#FAFAFA] px-5 py-4">
                        <p className="text-xs font-bold uppercase tracking-wide text-[#BDBDBD]">
                          Deployed At
                        </p>
                        <p className="mt-1 text-sm font-extrabold text-[#696969]">
                          {deployedAt}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="border border-[#E7E7E7] bg-[#FAFAFA] px-6 py-6">
                    <p className="text-lg font-extrabold text-[#696969]">
                      Final Check
                    </p>

                    <div className="mt-5 space-y-4">
                      <div className="flex items-start gap-3">
                        <CheckCircleIcon
                          className={`mt-0.5 h-5 w-5 ${
                            questions.length > 0
                              ? "text-[#29A177]"
                              : "text-[#BDBDBD]"
                          }`}
                        />
                        <p className="text-sm font-medium leading-6 text-[#777]">
                          Questions have been generated.
                        </p>
                      </div>

                      <div className="flex items-start gap-3">
                        <CheckCircleIcon
                          className={`mt-0.5 h-5 w-5 ${
                            isReadyToDeploy
                              ? "text-[#29A177]"
                              : "text-[#BDBDBD]"
                          }`}
                        />
                        <p className="text-sm font-medium leading-6 text-[#777]">
                          All questions are reviewed and approved.
                        </p>
                      </div>

                      <div className="flex items-start gap-3">
                        <CheckCircleIcon
                          className={`mt-0.5 h-5 w-5 ${
                            isDeployed
                              ? "text-[#FFCC00]"
                              : "text-[#BDBDBD]"
                          }`}
                        />
                        <p className="text-sm font-medium leading-6 text-[#777]">
                          Assessment is formally assigned to the student.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleDeploy}
                      disabled={!isReadyToDeploy || isDeployed}
                      className={`mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-xl px-6 text-base font-bold transition-colors ${
                        isDeployed
                          ? "cursor-not-allowed bg-[#FFCC00] text-white"
                          : isReadyToDeploy
                          ? "bg-[#29A177] text-white hover:bg-[#FFCC00]"
                          : "cursor-not-allowed bg-[#E5E5E5] text-[#999]"
                      }`}
                    >
                      <RocketLaunchIcon className="h-5 w-5" />
                      {isDeployed
                        ? "Assessment Deployed"
                        : "Deploy Assessment"}
                    </button>

                    {!isReadyToDeploy && (
                      <p className="mt-4 text-center text-xs font-medium leading-5 text-[#999]">
                        All questions must be approved before deployment.
                      </p>
                    )}

                    {isDeployed && (
                      <p className="mt-4 text-center text-xs font-medium leading-5 text-[#777]">
                        This assessment has been formally assigned to the
                        student.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}