"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, Clock3 } from "lucide-react";
import initialAssessmentData from "@/data/initial-assessment-questions.json";
import assessmentsMetadata from "@/data/assessments-metadata.json";
import type { TestOutput, TestType } from "@/types/test";
import { createTestAPI } from "@/hooks/use-test";
import {
  buildNumberComparisonQuestions,
} from "./test-types/number-comparison";
import { buildDotMatchingQuestions } from "./test-types/dot-matching";
import { buildNumberSeriesQuestions } from "./test-types/number-series";
import { buildSingleAdditionQuestions } from "./test-types/single-addition";
import { buildSingleSubtractionQuestions } from "./test-types/single-subtraction";
import { buildComplexArithmeticQuestions } from "./test-types/complex-arithmetic";
import { shuffle } from "./test-types/utils";
import type { Question, RawQuestion } from "./test-types/utils";
import { DotMatchingTest } from "@/components/student/tests/DotMatchingTest";
import { NumberComparisonTest } from "@/components/student/tests/NumberComparisonTest";
import { NumberSeriesTest } from "@/components/student/tests/NumberSeriesTest";
import { SingleAdditionTest } from "@/components/student/tests/SingleAdditionTest";
import { SingleSubtractionTest } from "@/components/student/tests/SingleSubtractionTest";
import { ComplexArithmeticTest } from "@/components/student/tests/ComplexArithmeticTest";

const metadata = assessmentsMetadata as Record<
  TestType,
  {
    title: string;
    question_prompt: string;
    time_limit?: number;
    warning_time?: number;
  }
>;

type TestResult = {
  answeredCount: number;
  correctCount: number;
  totalCount: number;
  percentCorrect: number;
  efficiencyScore?: number;
};

function getMedian(values: number[]) {
  if (!values.length) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const midpoint = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[midpoint - 1] + sorted[midpoint]) / 2;
  }

  return sorted[midpoint];
}

const testBuilders: Record<
  TestType,
  (tests: RawQuestion[], prompt: string) => Question[]
> = {
  number_comparison: buildNumberComparisonQuestions,
  dot_matching: buildDotMatchingQuestions,
  number_series: buildNumberSeriesQuestions,
  single_addition: buildSingleAdditionQuestions,
  single_subtraction: buildSingleSubtractionQuestions,
  complex_arithmetic: buildComplexArithmeticQuestions,
};

function formatElapsedTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function StudentClassroomTestPage() {
  const router = useRouter();
  const testAPI = createTestAPI();
  const searchParams = useSearchParams();

  const params = useParams<{
    studentId: string;
    classroomId: string;
  }>();

  const { studentId, classroomId } = params;

  const testId = searchParams.get("testID") ?? "";
  const testTypeParam = searchParams.get("testtype") as TestType | null;

  const baseQuestions = useMemo(() => {
    if (!testTypeParam) return [];
    if (testId !== "initial-test") return [];
    const group = (initialAssessmentData as Record<
      string,
      { tests: RawQuestion[] }
    >)[testTypeParam];
    if (!group) return [];
    const prompt = metadata[testTypeParam]?.question_prompt ?? "";
    const builder = testBuilders[testTypeParam];
    return builder ? builder(group.tests, prompt) : [];
  }, [testId, testTypeParam]);

  const [questionOrder, setQuestionOrder] = useState<string[] | null>(null);

  useEffect(() => {
    if (!testTypeParam || testId !== "initial-test") return;
    if (!baseQuestions.length) return;

    const storageKey = `initialTestOrder:${studentId}:${classroomId}:${testId}:${testTypeParam}`;

    try {
      const stored = localStorage.getItem(storageKey);
      const parsed = stored ? (JSON.parse(stored) as string[]) : null;
      const baseIds = baseQuestions.map((item) => item.id);
      const isValid =
        parsed &&
        Array.isArray(parsed) &&
        parsed.length === baseIds.length &&
        parsed.every((id) => baseIds.includes(id));

      if (isValid) {
        setQuestionOrder(parsed);
        return;
      }

      const shuffled = shuffle(baseIds);
      localStorage.setItem(storageKey, JSON.stringify(shuffled));
      setQuestionOrder(shuffled);
    } catch (error) {
      console.error("Failed to load test order", error);
      setQuestionOrder(baseQuestions.map((item) => item.id));
    }
  }, [baseQuestions, classroomId, studentId, testId, testTypeParam]);

  const questions = useMemo(() => {
    if (!questionOrder) return baseQuestions;
    const mapped = new Map(baseQuestions.map((item) => [item.id, item]));
    return questionOrder
      .map((id) => mapped.get(id))
      .filter((item): item is Question => Boolean(item));
  }, [baseQuestions, questionOrder]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [reactionTimes, setReactionTimes] = useState<Record<string, number>>(
    {}
  );
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [questionStartAt, setQuestionStartAt] = useState(() => Date.now());
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  const timeLimitMinutes = testTypeParam
    ? metadata[testTypeParam]?.time_limit ?? 0
    : 0;
  const warningTimeSeconds = testTypeParam
    ? metadata[testTypeParam]?.warning_time ?? 0
    : 0;
  const timeLimitSeconds = Math.max(timeLimitMinutes, 0) * 60;
  const timeLeftSeconds = timeLimitSeconds
    ? Math.max(timeLimitSeconds - elapsedSeconds, 0)
    : null;
  const isWarningActive =
    timeLeftSeconds !== null &&
    warningTimeSeconds > 0 &&
    timeLeftSeconds <= warningTimeSeconds;

  useEffect(() => {
    if (isSubmitted) return;

    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted]);

  useEffect(() => {
    setQuestionStartAt(Date.now());
  }, [currentIndex]);

  useEffect(() => {
    if (!timeLimitSeconds || isSubmitted) return;
    if (elapsedSeconds < timeLimitSeconds) return;

    handleSubmit();
  }, [elapsedSeconds, isSubmitted, timeLimitSeconds]);

  const currentQuestion = questions[currentIndex];
  const selectedAnswer = currentQuestion
    ? answers[currentQuestion.id]
    : undefined;

  const isFirstQuestion = currentIndex === 0;
  const isLastQuestion = currentIndex === questions.length - 1;
  const answeredCount = Object.keys(answers).length;

  const progressPercent = questions.length
    ? ((currentIndex + 1) / questions.length) * 100
    : 0;

  const isEfficiencyTest =
    testTypeParam === "number_comparison" ||
    testTypeParam === "dot_matching";

  const handleAnswer = (choice: string) => {
    const now = Date.now();

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: choice,
    }));

    setReactionTimes((prev) => {
      if (prev[currentQuestion.id] !== undefined) {
        return prev;
      }

      return {
        ...prev,
        [currentQuestion.id]: (now - questionStartAt) / 1000,
      };
    });
  };

  async function handleSubmit() {
    if (isSubmitted) return;

    const totalCount = questions.length;
    const correctItems = questions.filter(
      (item) => answers[item.id] === item.correctAnswer
    );
    const correctCount = correctItems.length;
    const percentCorrect = totalCount
      ? (correctCount / totalCount) * 100
      : 0;

    const records = questions.map((item) => ({
      number: answers[item.id] === item.correctAnswer,
      response_time: reactionTimes[item.id],
    }));

    const output: TestOutput = {
      answered: answeredCount,
      correct: correctCount,
      total: totalCount,
      accuracy: percentCorrect,
      elapsed_seconds: elapsedSeconds,
      records,
    };

    if (isEfficiencyTest) {
      const correctReactionTimes = correctItems
        .map((item) => reactionTimes[item.id])
        .filter((value) => Number.isFinite(value));
      const medianReactionTime = getMedian(correctReactionTimes as number[]);
      const efficiencyScore = percentCorrect
        ? medianReactionTime / percentCorrect
        : 0;

      output.efficiency_score = efficiencyScore;

      setResult({
        answeredCount,
        correctCount,
        totalCount,
        percentCorrect,
        efficiencyScore,
      });
    } else {
      setResult({
        answeredCount,
        correctCount,
        totalCount,
        percentCorrect,
      });
    }

    setIsSubmitted(true);

    if (testTypeParam) {
      const apiResult = await testAPI.recordTest(
        classroomId,
        studentId,
        testTypeParam,
        output
      );

      if (!apiResult.success) {
        console.error("Failed to save test", apiResult.error);
      }
    }
  }

  if (!testTypeParam || testId !== "initial-test") {
    return (
      <main className="flex min-h-screen w-full items-center justify-center bg-[#F7F7F7] px-6">
        <div className="max-w-xl text-center">
          <h1 className="text-4xl font-extrabold text-[#777]">
            Test not available
          </h1>
          <p className="mt-3 text-base font-medium text-[#9A9A9A]">
            Please return to the classroom and choose a valid test type.
          </p>
          <Link
            href={`/student/${studentId}/classrooms/${classroomId}`}
            className="mt-8 inline-flex h-12 items-center justify-center rounded-md bg-[#29A177] px-8 text-sm font-semibold text-white transition hover:bg-[#DFDC2F]"
          >
            Back to Classroom
          </Link>
        </div>
      </main>
    );
  }

  if (!currentQuestion) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center bg-[#F7F7F7] px-6">
        <div className="max-w-xl text-center">
          <h1 className="text-4xl font-extrabold text-[#777]">
            No questions found
          </h1>
          <p className="mt-3 text-base font-medium text-[#9A9A9A]">
            This test currently has no available questions.
          </p>
          <Link
            href={`/student/${studentId}/classrooms/${classroomId}`}
            className="mt-8 inline-flex h-12 items-center justify-center rounded-md bg-[#29A177] px-8 text-sm font-semibold text-white transition hover:bg-[#DFDC2F]"
          >
            Back to Classroom
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-[#F7F7F7]">
      <section className="flex min-h-screen w-full flex-col">
        <header className="bg-[#29A177] px-[5vw] py-[5vh] text-white">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => router.push(`/student/${studentId}/classrooms/${classroomId}`)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 transition hover:text-white"
            >
              <ArrowLeft size={18} />
              Back to Classroom
            </button>

            <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${isWarningActive
              ? "bg-[#FFCC00] text-[#2D2D2D]"
              : "bg-white/15 text-white/80"
              }`}>
              <Clock3 size={16} />
              {timeLeftSeconds !== null
                ? formatElapsedTime(timeLeftSeconds)
                : formatElapsedTime(elapsedSeconds)}
            </div>
          </div>

          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
              Initial Assessment
            </p>
            <h1 className="mt-3 text-4xl font-extrabold">
              {metadata[testTypeParam]?.title ?? "Assessment"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-medium text-white/80">
              Answer each item carefully.
            </p>
          </div>

          {timeLeftSeconds !== null && isWarningActive && (
            <p className="mt-4 text-sm font-semibold text-[#FFCC00]">
              Time is almost up.
            </p>
          )}

          <div className="mt-6 h-2 w-full rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-[#FFCC00] transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </header>

        <section className="flex flex-1 flex-col items-center justify-center px-[5vw] py-[5vh]">
          <div className="w-full max-w-none rounded-3xl bg-white p-10 shadow-sm">
            {isSubmitted && result ? (
              <div className="flex flex-col items-center gap-6 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#BDBDBD]">
                  Test Completed
                </p>
                <h2 className="text-4xl font-extrabold text-[#5A5A5A]">
                  Score: {result.correctCount}/{result.totalCount}
                </h2>
                <p className="text-lg font-semibold text-[#8F8F8F]">
                  Accuracy: {result.percentCorrect.toFixed(1)}%
                </p>
                {isEfficiencyTest && (
                  <p className="text-lg font-semibold text-[#6B6B6B]">
                    Efficiency Score: {result.efficiencyScore?.toFixed(4)}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() =>
                    router.push(`/student/${studentId}/classrooms/${classroomId}`)
                  }
                  className="mt-4 inline-flex items-center justify-center rounded-full bg-[#29A177] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#DFDC2F]"
                >
                  Back to Classroom
                </button>
              </div>
            ) : (
              <>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#BDBDBD]">
                  Question {currentIndex + 1} of {questions.length}
                </p>

                {testTypeParam === "dot_matching" && (
                  <DotMatchingTest
                    question={currentQuestion}
                    selectedAnswer={selectedAnswer}
                    onAnswer={handleAnswer}
                  />
                )}
                {testTypeParam === "number_comparison" && (
                  <NumberComparisonTest
                    question={currentQuestion}
                    selectedAnswer={selectedAnswer}
                    onAnswer={handleAnswer}
                  />
                )}
                {testTypeParam === "number_series" && (
                  <NumberSeriesTest
                    question={currentQuestion}
                    selectedAnswer={selectedAnswer}
                    onAnswer={handleAnswer}
                  />
                )}
                {testTypeParam === "single_addition" && (
                  <SingleAdditionTest
                    question={currentQuestion}
                    selectedAnswer={selectedAnswer}
                    onAnswer={handleAnswer}
                  />
                )}
                {testTypeParam === "single_subtraction" && (
                  <SingleSubtractionTest
                    question={currentQuestion}
                    selectedAnswer={selectedAnswer}
                    onAnswer={handleAnswer}
                  />
                )}
                {testTypeParam === "complex_arithmetic" && (
                  <ComplexArithmeticTest
                    question={currentQuestion}
                    selectedAnswer={selectedAnswer}
                    onAnswer={handleAnswer}
                  />
                )}

                <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
                    className="inline-flex items-center gap-2 rounded-full border border-[#E5E5E5] bg-white px-5 py-2 text-sm font-semibold text-[#6B6B6B] transition hover:border-[#BDBDBD]"
                    disabled={isFirstQuestion}
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>

                  {isLastQuestion ? (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="inline-flex items-center gap-2 rounded-full bg-[#29A177] px-6 py-2 text-sm font-semibold text-white transition hover:bg-[#DFDC2F]"
                      disabled={!answeredCount}
                    >
                      Finish Test
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentIndex((prev) =>
                          Math.min(prev + 1, questions.length - 1)
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-full bg-[#29A177] px-6 py-2 text-sm font-semibold text-white transition hover:bg-[#DFDC2F]"
                    >
                      Next
                      <ChevronRight size={16} />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
