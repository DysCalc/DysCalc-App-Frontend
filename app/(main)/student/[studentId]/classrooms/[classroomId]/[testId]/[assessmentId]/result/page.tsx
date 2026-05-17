"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

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
  answers: Record<string, string>;
  completedAt: string;
};

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
  const [secondsLeft, setSecondsLeft] = useState(15);

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

  if (!result) {
    return (
      <main className="flex h-full w-full items-center justify-center overflow-hidden bg-[#29A177] px-6">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-white">
            No assessment record found
          </h1>

          <p className="mt-3 text-lg font-medium text-white/80">
            Please complete the assessment first.
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
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/15">
            <CheckCircle2 size={58} strokeWidth={2.4} className="text-white" />
          </div>

          <p className="mt-10 text-sm font-bold uppercase tracking-[0.3em] text-white/65">
            Assessment Completed
          </p>

          <h1 className="mt-5 text-5xl font-extrabold leading-none text-white md:text-7xl">
            Great job!
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-xl font-semibold leading-8 text-white/90">
            Congratulations on finishing the assessment.
          </p>

          <p className="mx-auto mt-4 max-w-2xl text-lg font-medium leading-7 text-white/75">
            Your responses have been submitted successfully. The assessment
            results are processed internally to help DysCalc prepare your
            personalized classroom experience.
          </p>

          <div className="mt-12 flex flex-col items-center gap-4">
            <Link
              href={`/student/${studentId}/classrooms/${classroomId}`}
              className="flex h-12 min-w-[230px] items-center justify-center rounded-md bg-white px-10 text-lg font-bold text-[#29A177] transition-colors duration-300 hover:bg-[#FFCC00] hover:text-white active:bg-[#EAB300]"
            >
              Continue to Classroom
            </Link>

            <p className="text-sm font-medium text-white/70">
              Redirecting to your classroom in {secondsLeft}s
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}