"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Lock,
  PlayCircle,
} from "lucide-react";
import QuitTestModal from "@/components/student/QuitTestModal";
import baselineAssessmentData from "@/data/baseline-assessment-questions.json";

type QuestionType =
  | "number-comparison"
  | "digit-dot-matching"
  | "number-series"
  | "single-digit-addition"
  | "single-digit-subtraction"
  | "multi-digit-calculation";

type Question = {
  id: string;
  type: QuestionType;
  prompt: string;
  display?: string;
  choices: string[];
  correctAnswer: string;
  sourceQuestion?: string;
};

type TopicCard = {
  id: QuestionType;
  title: string;
  subtitle: string;
  description: string;
  questions: Question[];
};

type TopicElapsedSeconds = Record<QuestionType, number>;

const assessmentData = {
  "baseline-assessment": {
    title: "Assessment Test",
    subtitle: "Initial Numeracy Screening",
    instruction:
      "Complete each topic in order. The next topic will unlock after finishing the current one.",
  },
  "initial-assessment": {
    title: "Initial Assessment",
    subtitle: "Numeracy Screening",
    instruction:
      "Complete each topic in order. Your responses will help DysCalc prepare your learning path.",
  },
};

const topics = baselineAssessmentData.topics as TopicCard[];

const topicQuestions = topics.reduce((acc, topic) => {
  acc[topic.id] = topic.questions;
  return acc;
}, {} as Record<QuestionType, Question[]>);

const questions: Question[] = topics.flatMap((topic) => topic.questions);

function getInitialTopicTimes(): TopicElapsedSeconds {
  return {
    "number-comparison": 0,
    "digit-dot-matching": 0,
    "number-series": 0,
    "single-digit-addition": 0,
    "single-digit-subtraction": 0,
    "multi-digit-calculation": 0,
  };
}

function getQuestionTypeLabel(type: QuestionType) {
  if (type === "number-comparison") return "Number Comparison";
  if (type === "digit-dot-matching") return "Digit-Dot Matching";
  if (type === "number-series") return "Number Series";
  if (type === "single-digit-addition") return "Single-Digit Addition";
  if (type === "single-digit-subtraction") return "Single-Digit Subtraction";
  return "Multi-Digit Addition and Subtraction";
}

function formatElapsedTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function classifyBaseline(scorePercent: number) {
  if (scorePercent >= 75) return "Typical";
  return "High Risk";
}

function parseQuestionPair(question: Question) {
  const source = question.sourceQuestion ?? question.display ?? "";

  if (source.includes(" vs ")) {
    return source.split(" vs ").map((value) => value.trim());
  }

  return source.split(/\s+/).filter(Boolean);
}

function isOneLineChoiceQuestion(type: QuestionType) {
  return (
    type === "number-series" ||
    type === "single-digit-addition" ||
    type === "single-digit-subtraction" ||
    type === "multi-digit-calculation"
  );
}

function renderDots(value: string) {
  const dotCount = Number(value);

  if (!Number.isFinite(dotCount)) {
    return value;
  }

  return Array.from({ length: dotCount }, () => "●").join(" ");
}

function hashString(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function shuffleChoices(choices: string[], seedKey: string) {
  const uniqueChoices = Array.from(new Set(choices));
  const shuffled = [...uniqueChoices];
  const baseSeed = hashString(seedKey);

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(seededRandom(baseSeed + index) * (index + 1));

    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

export default function StudentAssessmentPage() {
  const router = useRouter();

  const params = useParams<{
    studentId: string;
    classroomId: string;
    testId: string;
    assessmentId: string;
  }>();

  const { studentId, classroomId, testId, assessmentId } = params;

  const assessment =
    assessmentData[assessmentId as keyof typeof assessmentData] ??
    assessmentData["baseline-assessment"];

  const [activeTopicId, setActiveTopicId] = useState<QuestionType | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [topicElapsedSeconds, setTopicElapsedSeconds] =
    useState<TopicElapsedSeconds>(getInitialTopicTimes);
  const [submitted, setSubmitted] = useState(false);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [completedTopics, setCompletedTopics] = useState<QuestionType[]>([]);
  const [hasLoadedStoredData, setHasLoadedStoredData] = useState(false);

  const activeTopic = topics.find((topic) => topic.id === activeTopicId);

  const activeQuestions = useMemo(() => {
    if (!activeTopicId) return [];
    return topicQuestions[activeTopicId] ?? [];
  }, [activeTopicId]);

  const currentQuestion = activeQuestions[currentIndex];

  const randomizedChoices = useMemo(() => {
    if (!currentQuestion) return [];

    return shuffleChoices(
      currentQuestion.choices,
      `${studentId}-${classroomId}-${currentQuestion.id}`
    );
  }, [currentQuestion, studentId, classroomId]);

  const selectedAnswer = currentQuestion
    ? answers[currentQuestion.id]
    : undefined;

  const isFirstQuestion = currentIndex === 0;
  const isLastQuestion = currentIndex === activeQuestions.length - 1;

  const answeredCount = useMemo(() => {
    return Object.keys(answers).length;
  }, [answers]);

  const activeTopicProgressPercent = activeQuestions.length
    ? ((currentIndex + 1) / activeQuestions.length) * 100
    : 0;

  const overallProgressPercent = (completedTopics.length / topics.length) * 100;

  useEffect(() => {
    const storedCompletedTopics = localStorage.getItem(
      `baselineAssessmentTopics:${studentId}:${classroomId}`
    );

    const storedTopicTimes = localStorage.getItem(
      `baselineAssessmentTopicTimes:${studentId}:${classroomId}`
    );

    const storedAnswers = localStorage.getItem(
      `baselineAssessmentAnswers:${studentId}:${classroomId}`
    );

    const storedOverallTime = localStorage.getItem(
      `baselineAssessmentOverallTime:${studentId}:${classroomId}`
    );

    if (storedCompletedTopics) {
      setCompletedTopics(JSON.parse(storedCompletedTopics));
    }

    if (storedTopicTimes) {
      setTopicElapsedSeconds(JSON.parse(storedTopicTimes));
    }

    if (storedAnswers) {
      setAnswers(JSON.parse(storedAnswers));
    }

    if (storedOverallTime) {
      setElapsedSeconds(Number(storedOverallTime));
    }

    setHasLoadedStoredData(true);
  }, [studentId, classroomId]);

  useEffect(() => {
    if (!hasLoadedStoredData) return;

    localStorage.setItem(
      `baselineAssessmentTopicTimes:${studentId}:${classroomId}`,
      JSON.stringify(topicElapsedSeconds)
    );
  }, [topicElapsedSeconds, studentId, classroomId, hasLoadedStoredData]);

  useEffect(() => {
    if (!hasLoadedStoredData) return;

    localStorage.setItem(
      `baselineAssessmentAnswers:${studentId}:${classroomId}`,
      JSON.stringify(answers)
    );
  }, [answers, studentId, classroomId, hasLoadedStoredData]);

  useEffect(() => {
    if (!hasLoadedStoredData) return;

    localStorage.setItem(
      `baselineAssessmentOverallTime:${studentId}:${classroomId}`,
      String(elapsedSeconds)
    );
  }, [elapsedSeconds, studentId, classroomId, hasLoadedStoredData]);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);

      if (activeTopicId) {
        setTopicElapsedSeconds((prev) => ({
          ...prev,
          [activeTopicId]: prev[activeTopicId] + 1,
        }));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [activeTopicId]);

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

  const handleBackToClassroom = () => {
    if (!submitted) {
      setShowQuitModal(true);
      return;
    }

    router.push(`/student/${studentId}/classrooms/${classroomId}`);
  };

  const handleCancelQuit = () => {
    setShowQuitModal(false);
  };

  const handleConfirmQuit = () => {
    setShowQuitModal(false);
    router.push(`/student/${studentId}/classrooms`);
  };

  const handleSelectTopic = (topicId: QuestionType, index: number) => {
    const isCompleted = completedTopics.includes(topicId);
    const isUnlocked =
      index === 0 || completedTopics.includes(topics[index - 1].id);

    if (!isUnlocked && !isCompleted) return;

    setActiveTopicId(topicId);
    setCurrentIndex(0);
  };

  const handleSelectAnswer = (choice: string) => {
    if (!currentQuestion) return;

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

  const handleTopicSubmit = () => {
    if (!activeTopicId) return;

    const updatedCompletedTopics = completedTopics.includes(activeTopicId)
      ? completedTopics
      : [...completedTopics, activeTopicId];

    setCompletedTopics(updatedCompletedTopics);

    localStorage.setItem(
      `baselineAssessmentTopics:${studentId}:${classroomId}`,
      JSON.stringify(updatedCompletedTopics)
    );

    setActiveTopicId(null);
    setCurrentIndex(0);

    if (updatedCompletedTopics.length === topics.length) {
      handleFinalSubmit(updatedCompletedTopics);
    }
  };

  const handleFinalSubmit = (finalCompletedTopics: QuestionType[]) => {
    const correctCount = questions.filter(
      (question) => answers[question.id] === question.correctAnswer
    ).length;

    const unansweredCount = questions.length - answeredCount;
    const wrongCount = questions.length - correctCount - unansweredCount;
    const scorePercent = Math.round((correctCount / questions.length) * 100);
    const classification = classifyBaseline(scorePercent);

    const topicScores = topics.map((topic) => {
      const topicItems = topicQuestions[topic.id];

      const topicCorrectCount = topicItems.filter(
        (question) => answers[question.id] === question.correctAnswer
      ).length;

      const topicAnsweredCount = topicItems.filter(
        (question) => answers[question.id]
      ).length;

      const topicUnansweredCount = topicItems.length - topicAnsweredCount;
      const topicWrongCount =
        topicItems.length - topicCorrectCount - topicUnansweredCount;

      const topicScorePercent = Math.round(
        (topicCorrectCount / topicItems.length) * 100
      );

      return {
        topicId: topic.id,
        title: topic.title,
        totalItems: topicItems.length,
        answeredCount: topicAnsweredCount,
        correctCount: topicCorrectCount,
        wrongCount: topicWrongCount,
        unansweredCount: topicUnansweredCount,
        scorePercent: topicScorePercent,
        elapsedSeconds: topicElapsedSeconds[topic.id],
        elapsedTime: formatElapsedTime(topicElapsedSeconds[topic.id]),
      };
    });

    const baselineResultData = {
      testId,
      assessmentId,
      assessmentType: "baseline",
      totalItems: questions.length,
      answeredCount,
      correctCount,
      wrongCount,
      unansweredCount,
      scorePercent,
      classification,
      elapsedSeconds,
      elapsedTime: formatElapsedTime(elapsedSeconds),
      answers,
      completedTopics: finalCompletedTopics,
      topicElapsedSeconds,
      topicScores,
      completedAt: new Date().toISOString(),
    };

    localStorage.setItem(
      `baselineAssessmentResult:${studentId}:${classroomId}`,
      JSON.stringify(baselineResultData)
    );

    localStorage.setItem(
      `baselineAssessmentCompleted:${studentId}:${classroomId}`,
      "true"
    );

    localStorage.removeItem(
      `baselineAssessmentTopics:${studentId}:${classroomId}`
    );
    localStorage.removeItem(
      `baselineAssessmentTopicTimes:${studentId}:${classroomId}`
    );
    localStorage.removeItem(
      `baselineAssessmentAnswers:${studentId}:${classroomId}`
    );
    localStorage.removeItem(
      `baselineAssessmentOverallTime:${studentId}:${classroomId}`
    );

    setSubmitted(true);

    router.push(
      `/student/${studentId}/classrooms/${classroomId}/${testId}/${assessmentId}/result`
    );
  };

  if (!activeTopicId) {
    return (
      <main className="h-full w-full overflow-hidden bg-white">
        <section className="flex h-full w-full flex-col overflow-hidden">
          {/* Header */}
          <header className="shrink-0 bg-[#29A177] pt-8 text-white">
            <div className="flex items-center justify-between px-6">
              <button
                type="button"
                onClick={handleBackToClassroom}
                className="inline-flex items-center gap-2 text-sm font-semibold text-white/75 transition hover:text-white"
              >
                <ArrowLeft size={18} />
                Back to Classrooms
              </button>

              <div className="flex items-center gap-2 px-7 py-2 pr-7 text-sm font-semibold text-white/80">
                <Clock3 size={16} />
                Overall: {formatElapsedTime(elapsedSeconds)}
              </div>
            </div>

            <div className="flex items-end justify-between gap-8 px-12 py-10">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-white/60">
                  {assessment.subtitle}
                </p>

                <h1 className="mt-4 text-6xl font-extrabold leading-none text-white">
                  {assessment.title}
                </h1>

                <p className="mt-1 max-w-3xl text-lg font-base leading-7 text-white/80">
                  {assessment.instruction}
                </p>
              </div>

              <div className="hidden text-right md:block">
                <p className="text-base font-bold uppercase tracking-wide text-white/60">
                  Topics Completed
                </p>

                <p className="mt-2 text-5xl font-extrabold text-white">
                  {completedTopics.length} / {topics.length}
                </p>
              </div>
            </div>

            <div className="h-2 w-full bg-white/20">
              <div
                className="h-full bg-[#FFCC00] transition-all duration-500"
                style={{ width: `${overallProgressPercent}%` }}
              />
            </div>
          </header>

          {/* Body */}
          <div className="min-h-0 flex-1 overflow-hidden bg-[#F7F7F7] px-12 py-8">
            <div className="grid h-full grid-cols-3 gap-2 overflow-y-auto">
              {topics.map((topic, index) => {
                const isCompleted = completedTopics.includes(topic.id);
                const isUnlocked =
                  index === 0 ||
                  completedTopics.includes(topics[index - 1].id);
                const topicItemCount = topicQuestions[topic.id].length;
                const topicTime = topicElapsedSeconds[topic.id] ?? 0;
                const hasLongTitle = topic.title.length >= 28;

                return (
                  <div
                    key={topic.id}
                    className={`group flex min-h-[260px] flex-col border px-7 py-5 text-left transition-all duration-300 ${
                      isCompleted
                        ? "border-[#29A177] bg-[#ECF9F4] text-[#29A177]"
                        : isUnlocked
                        ? "border-[#E7E7E7] bg-white text-[#5C5E64] hover:border-[#B5B5B5]"
                        : "border-[#E7E7E7] bg-[#F7F7F7] text-[#B8B8B8]"
                    }`}
                  >
                    <div className="flex shrink-0 items-center justify-between gap-4">
                      <p
                        className={`text-sm font-bold uppercase leading-none tracking-[0.25em] ${
                          isCompleted
                            ? "text-[#29A177]/70"
                            : isUnlocked
                            ? "text-[#9A9A9A]"
                            : "text-[#C7C7C7]"
                        }`}
                      >
                        {topic.subtitle}
                      </p>

                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                          isCompleted
                            ? "bg-[#DFF5EC] text-[#29A177]"
                            : isUnlocked
                            ? "bg-[#ECF9F4] text-[#29A177]"
                            : "bg-[#ECECEC] text-[#B8B8B8]"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle size={22} />
                        ) : isUnlocked ? (
                          <PlayCircle size={22} />
                        ) : (
                          <Lock size={20} />
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex flex-1 flex-col justify-between">
                      <div>
                        <h2
                          className={`font-extrabold leading-none ${
                            hasLongTitle ? "text-2xl" : "text-3xl"
                          }`}
                        >
                          {topic.title}
                        </h2>

                        <p
                          className={`mt-2 text-sm font-light leading-5 ${
                            isCompleted
                              ? "text-[#5C5E64]"
                              : isUnlocked
                              ? "text-[#777]"
                              : "text-[#B8B8B8]"
                          }`}
                        >
                          {topic.description}
                        </p>

                        <div className="mt-4 flex items-center justify-between gap-4 text-sm font-semibold leading-none">
                          <span>{topicItemCount} items</span>

                          <span className="inline-flex items-center gap-1.5 ">
                            <Clock3 size={14} />
                            {formatElapsedTime(topicTime)}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelectTopic(topic.id, index)}
                        disabled={!isUnlocked && !isCompleted}
                        className={`mt-6 flex h-11 w-full items-center justify-center rounded-md text-base font-bold leading-none transition-all duration-300 active:scale-[0.98] ${
                          isCompleted
                            ? "bg-[#29A177] text-white hover:bg-[#17815C]"
                            : isUnlocked
                            ? "bg-[#29A177] text-white hover:bg-[#FFCC00]"
                            : "cursor-not-allowed bg-[#E7E7E7] text-[#B8B8B8]"
                        }`}
                      >
                        {isCompleted
                          ? "Review Topic"
                          : isUnlocked
                          ? "Start Topic"
                          : "Locked"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {showQuitModal && (
          <QuitTestModal
            onCancel={handleCancelQuit}
            onConfirm={handleConfirmQuit}
          />
        )}
      </main>
    );
  }

  return (
    <main className="h-full w-full overflow-hidden bg-white">
      <section className="flex h-full w-full flex-col overflow-hidden">
        {/* Header */}
        <header className="shrink-0 bg-[#29A177] pt-8 text-white">
          <div className="flex items-center justify-between px-6">
            <button
              type="button"
              onClick={() => setActiveTopicId(null)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-white/75 transition hover:text-white"
            >
              <ArrowLeft size={18} />
              Back to Topics
            </button>

            <div className="flex justify-end gap-2 px-7 py-2 pr-11 text-sm font-semibold text-white/80">
              <div className="flex items-center gap-2">
                <Clock3 size={16} />
                Overall: {formatElapsedTime(elapsedSeconds)}
              </div>

              <div className="flex items-center gap-2 text-[#FFCC00]">
                <Clock3 size={16} />
                Topic: {formatElapsedTime(topicElapsedSeconds[activeTopicId])}
              </div>
            </div>
          </div>

          <div className="flex items-end justify-between gap-5 px-12 py-8">
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-4">
                <h1 className="text-4xl font-bold leading-none text-white">
                  {activeTopic?.title}
                </h1>
              </div>

              <p className="max-w-3xl text-lg text-white/80">
                Complete this topic to unlock the next assessment topic.
              </p>
            </div>

            <div className="hidden px-6 py-0 md:flex md:flex-col md:items-center md:justify-center">
              <p className="text-base font-bold uppercase tracking-wide text-white/60">
                Topic Progress
              </p>

              <p className="mt-1 text-4xl font-bold text-white">
                {currentIndex + 1} / {activeQuestions.length}
              </p>
            </div>
          </div>

          <div className="h-2 w-full bg-white/20">
            <div
              className="h-full bg-[#FFCC00] transition-all duration-300"
              style={{ width: `${activeTopicProgressPercent}%` }}
            />
          </div>
        </header>

        {/* Body */}
        <section className="flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-white">
          {currentQuestion && (
            <div className="flex min-h-0 flex-1 items-center justify-center px-6 py-6">
              <div className="grid w-full max-w-6xl grid-cols-[80px_1fr_80px] items-center gap-6">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={isFirstQuestion}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F2F2F2] text-[#B5B5B5] transition hover:bg-[#E8E8E8] hover:text-[#777] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={36} />
                </button>

                <div className="border border-[#E9E9E9] bg-[#FAFAFA] px-10 py-10 shadow-[0_18px_50px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center justify-between gap-5">
                    <div>
                      <p className="text-base font-bold uppercase tracking-wide text-[#BDBDBD]">
                        Question #{currentIndex + 1}
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
                    <>
                      {currentQuestion.type === "number-comparison" && (
                        <div className="mt-8 flex items-center justify-center gap-8">
                          {(() => {
                            const [leftValue, rightValue] =
                              parseQuestionPair(currentQuestion);

                            return (
                              <>
                                <div className="flex h-24 min-w-[120px] items-center justify-center rounded-2xl border border-[#E5E5E5] bg-white px-8 text-6xl font-extrabold leading-none text-[#555]">
                                  {leftValue}
                                </div>

                                <span className="text-2xl font-extrabold uppercase tracking-wide text-[#BDBDBD]">
                                  OR
                                </span>

                                <div className="flex h-24 min-w-[120px] items-center justify-center rounded-2xl border border-[#E5E5E5] bg-white px-8 text-6xl font-extrabold leading-none text-[#555]">
                                  {rightValue}
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      )}

                      {currentQuestion.type === "digit-dot-matching" && (
                        <div className="mt-8 flex items-center justify-center gap-6">
                          {(() => {
                            const [numberValue, dotValue] =
                              parseQuestionPair(currentQuestion);

                            return (
                              <>
                                <div className="flex h-28 min-w-[130px] items-center justify-center rounded-2xl border border-[#E5E5E5] bg-white px-8 text-6xl font-extrabold leading-none text-[#555]">
                                  {numberValue}
                                </div>

                                <div className="flex h-28 min-w-[220px] items-center justify-center rounded-2xl border border-[#E5E5E5] bg-white px-8 text-4xl font-extrabold leading-none tracking-wide text-[#555]">
                                  {renderDots(dotValue)}
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      )}

                      {currentQuestion.type !== "number-comparison" &&
                        currentQuestion.type !== "digit-dot-matching" && (
                          <div className="mt-8 text-center text-5xl font-extrabold leading-none tracking-wide text-[#555]">
                            {currentQuestion.display}
                          </div>
                        )}
                    </>
                  )}

                  <div
                    className={
                      isOneLineChoiceQuestion(currentQuestion.type)
                        ? "mt-10 flex items-center justify-center gap-5"
                        : "mt-10 grid gap-5 sm:grid-cols-2"
                    }
                  >
                    {randomizedChoices.map((choice, choiceIndex) => {
                      const isSelected = selectedAnswer === choice;

                      return (
                        <button
                          key={`${currentQuestion.id}-${choice}-${choiceIndex}`}
                          type="button"
                          onClick={() => handleSelectAnswer(choice)}
                          className={`flex h-20 items-center justify-center rounded-2xl border text-4xl font-bold transition-colors duration-300 ${
                            isOneLineChoiceQuestion(currentQuestion.type)
                              ? "min-w-[150px] px-8"
                              : ""
                          } ${
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
          )}

          <div className="flex shrink-0 items-center justify-between border-t border-[#E5E5E5] px-[60px] py-4">
            <div className="flex max-w-[75%] flex-wrap items-center gap-2">
              {activeQuestions.map((question, index) => {
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
                onClick={handleTopicSubmit}
                className="flex h-11 min-w-[170px] items-center justify-center rounded-md bg-[#29A177] px-10 text-lg font-bold text-white transition-colors duration-300 hover:bg-[#FFCC00] active:bg-[#EAB300]"
              >
                Complete Topic
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