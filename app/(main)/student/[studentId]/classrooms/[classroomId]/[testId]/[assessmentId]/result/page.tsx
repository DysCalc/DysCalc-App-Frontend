"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type BaselineAssessmentResult = {
  testId: string;
  assessmentId: string;
  assessmentType: "baseline";
  totalItems: number;
  answeredCount: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  scorePercent: number;
  classification: "Typical" | "High Risk";
  elapsedSeconds: number;
  elapsedTime: string;
  answers: Record<number, string>;
  completedAt: string;
};

function formatAverageTime(seconds: number, totalItems: number) {
  if (!totalItems) return "0.0s";

  const average = seconds / totalItems;

  if (average >= 60) {
    return `${(average / 60).toFixed(1)}m`;
  }

  return `${average.toFixed(1)}s`;
}

function getClassificationMessage(classification: string) {
  if (classification === "Typical") {
    return "Typical";
  }

  return "High Risk";
}

function getClassificationDescription(classification: string) {
  if (classification === "Typical") {
    return "Your baseline assessment shows typical numeracy performance based on this screening.";
  }

  return "Your baseline assessment shows possible risk indicators and may need additional learning support.";
}

export default function BaselineAssessmentResultPage() {
  const router = useRouter();

  const params = useParams<{
    studentId: string;
    classroomId: string;
    testId: string;
    assessmentId: string;
  }>();

  const { studentId, classroomId, testId, assessmentId } = params;

  const [result, setResult] = useState<BaselineAssessmentResult | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(7);

  useEffect(() => {
    const storedResult = localStorage.getItem(
      `baselineAssessmentResult:${studentId}:${classroomId}`
    );

    if (storedResult) {
      setResult(JSON.parse(storedResult));
    }
  }, [studentId, classroomId]);

  useEffect(() => {
    if (!result) return;
    if (secondsLeft <= 0) return;

    const countdown = setTimeout(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(countdown);
  }, [result, secondsLeft]);

  useEffect(() => {
    if (!result) return;
    if (secondsLeft !== 0) return;

    router.push(`/student/${studentId}/classrooms/${classroomId}`);
  }, [result, secondsLeft, router, studentId, classroomId]);

  const classificationMessage = useMemo(() => {
    if (!result) return "";
    return getClassificationMessage(result.classification);
  }, [result]);

  const classificationDescription = useMemo(() => {
    if (!result) return "";
    return getClassificationDescription(result.classification);
  }, [result]);

  if (!result) {
    return (
      <main className="flex h-full w-full items-center justify-center overflow-hidden bg-[#29A177] px-6">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-white">
            No assessment result found
          </h1>

          <p className="mt-3 text-lg font-medium text-white/80">
            Please complete the baseline assessment first.
          </p>

          <Link
            href={`/student/${studentId}/classrooms/${classroomId}/${testId}/${assessmentId}`}
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
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 text-center">
          <p className="text-xl font-bold uppercase tracking-wide text-white/75">
            Baseline Assessment Result
          </p>

          <h1 className="mt-5 text-6xl font-extrabold leading-none text-white md:text-7xl">
            {classificationMessage}
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg font-medium leading-7 text-white/80">
            {classificationDescription}
          </p>

          <div className="mt-14">
            <p className="text-4xl font-extrabold leading-none text-[#FFCC00]">
              Score: {result.correctCount}/{result.totalItems}
            </p>

            <p className="mt-3 text-xl font-semibold text-white">
              {result.scorePercent}% Accuracy
            </p>
          </div>

          <div className="mt-12 flex flex-col items-center gap-4">
            <Link
              href={`/student/${studentId}/classrooms/${classroomId}`}
              className="flex h-12 min-w-[230px] items-center justify-center rounded-md bg-white px-10 text-lg font-bold text-[#29A177] transition-colors duration-300 hover:bg-[#FFCC00] hover:text-white active:bg-[#EAB300]"
            >
              Continue
            </Link>

            <p className="text-sm font-medium text-white/70">
              Redirecting to your learning path in {secondsLeft}s
            </p>

            <p className="text-sm font-medium text-white/60">
              Total time: {result.elapsedTime}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}