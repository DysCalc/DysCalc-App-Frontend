"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

type TestResult = {
  testId: string;
  totalItems: number;
  answeredCount: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  elapsedSeconds: number;
  elapsedTime: string;
  answers: Record<number, string>;
};

function formatAverageTime(seconds: number, totalItems: number) {
  if (!totalItems) return "0.0s";

  const average = seconds / totalItems;

  if (average >= 60) {
    return `${(average / 60).toFixed(1)}m`;
  }

  return `${average.toFixed(1)}s`;
}

function getScoreMessage(scorePercent: number) {
  if (scorePercent >= 90) return "Excellent!";
  if (scorePercent >= 75) return "Very Good!";
  if (scorePercent >= 50) return "Good Job!";
  return "Keep Practicing!";
}

function getScoreDescription(scorePercent: number) {
  if (scorePercent >= 90) {
    return "You showed strong mastery in this activity. Keep building your math confidence!";
  }

  if (scorePercent >= 75) {
    return "You did very well. A little more practice will make your skills even stronger.";
  }

  if (scorePercent >= 50) {
    return "Good effort. DysCalc will help you continue improving step by step.";
  }

  return "That is okay. This result helps DysCalc understand where you need more support.";
}

export default function TestResultPage() {
  const params = useParams<{
    studentId: string;
    classroomId: string;
    testId: string;
  }>();

  const { studentId, classroomId, testId } = params;

  const [result, setResult] = useState<TestResult | null>(null);

  useEffect(() => {
    const storedResult = localStorage.getItem("studentTestResult");

    if (storedResult) {
      setResult(JSON.parse(storedResult));
    }
  }, []);

  const scorePercent = useMemo(() => {
    if (!result || result.totalItems === 0) return 0;
    return Math.round((result.correctCount / result.totalItems) * 100);
  }, [result]);

  const scoreMessage = getScoreMessage(scorePercent);
  const scoreDescription = getScoreDescription(scorePercent);

  if (!result) {
    return (
      <main className="flex h-full w-full items-center justify-center overflow-hidden bg-[#29A177] px-6">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-white">
            No result found
          </h1>

          <p className="mt-3 text-lg font-medium text-white/80">
            Please complete the test first.
          </p>

          <Link
            href={`/student/${studentId}/classrooms/${classroomId}/${testId}`}
            className="mt-8 inline-flex h-12 min-w-[180px] items-center justify-center rounded-md bg-white px-8 text-lg font-bold text-[#29A177] transition-colors duration-300 hover:bg-[#FFCC00] hover:text-white"
          >
            Go Back
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="h-full w-full overflow-hidden bg-[#29A177] text-white">
      <section className="flex h-full w-full flex-col overflow-hidden">
        {/* Center Result */}
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center text-center">
          <h1 className="text-6xl font-extrabold leading-none text-white md:text-7xl">
            Score: {result.correctCount}/{result.totalItems}
          </h1>

          <p className="mt-4 text-4xl font-extrabold leading-none text-[#FFCC00]">
            {scoreMessage}
          </p>

          <p className="mx-auto mt-5 max-w-xl text-base font-medium leading-7 text-white/75">
            {scoreDescription}
          </p>

          <div className="mt-14">
            <p className="text-4xl font-extrabold leading-none text-white">
              {formatAverageTime(result.elapsedSeconds, result.totalItems)}
            </p>

            <p className="mt-3 text-xl font-semibold text-white">
              Average Time
            </p>
          </div>

          <div className="mt-14 flex flex-col items-center gap-4">
            <Link
              href={`/student/${studentId}/classrooms/${classroomId}`}
              className="flex h-12 min-w-[210px] items-center justify-center rounded-md bg-white px-10 text-lg font-bold text-[#29A177] transition-colors duration-300 hover:bg-[#FFCC00] hover:text-white active:bg-[#EAB300]"
            >
              Next
            </Link>

            <p className="text-sm font-medium text-white/70">
              Total time: {result.elapsedTime}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}