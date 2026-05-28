"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import CopyClassroomCodeButton from "@/components/student/CopyClassroomCodeButton";
import assessmentsMetadata from "@/data/assessments-metadata.json";
import type { TestType } from "@/types/test";
import type { ClassroomWithStudentCount } from "@/types";
import { createClassroomAPI } from "@/hooks/use-classroom";
import { createTestAPI, type UnifiedAssessment } from "@/hooks/use-test";

const testTypeOrder: TestType[] = [
  "number_comparison",
  "dot_matching",
  "number_series",
  "single_addition",
  "single_subtraction",
  "complex_arithmetic",
];

const testTypeCards = testTypeOrder.map((type: TestType) => {
  const metadata = assessmentsMetadata[type];

  return {
    id: type,
    title: metadata.title,
    description: metadata.description,
    accent: metadata.accent,
    background: metadata.background,
    ring: metadata.ring,
  };
});

const classroomAPI = createClassroomAPI();

export default function ClassroomLearningPathPage() {
  const router = useRouter();
  const testAPI = createTestAPI();

  const params = useParams<{
    studentId: string;
    classroomId: string;
  }>();

  const { studentId, classroomId } = params;

  const [activeTestId, setActiveTestId] = useState<string | null>(null);
  const [classroom, setClassroom] = useState<ClassroomWithStudentCount | null>(
    null
  );
  const [assessments, setAssessments] = useState<UnifiedAssessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      setLoadError(null);

      const [classroomResult, testResult] = await Promise.all([
        classroomAPI.getClassroomById(classroomId),
        testAPI.getAllTest(classroomId, studentId)
      ]);

      if (!isMounted) return;

      if (!classroomResult.success) {
        setLoadError(classroomResult.error || "Failed to load classroom");
      } else {
        setClassroom(classroomResult.data);
      }

      if (testResult.success && testResult.data) {
        setAssessments(testResult.data);
      }

      setIsLoading(false);
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [classroomId, studentId]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center bg-[#F7F7F7]">
        <p className="text-lg font-semibold text-[#9A9A9A]">
          Loading classroom...
        </p>
      </main>
    );
  }

  if (loadError || !classroom) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center bg-[#F7F7F7]">
        <div className="text-center">
          <p className="text-lg font-semibold text-[#9A9A9A]">
            {loadError || "Classroom not found."}
          </p>
          <Link
            href={`/student/${studentId}/classrooms`}
            className="mt-4 inline-flex items-center justify-center rounded-md border border-[#E5E5E5] bg-white px-5 py-2 text-sm font-semibold text-[#7A7A7A] transition hover:border-[#B0B0B0]"
          >
            Back to Classrooms
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-[#F7F7F7]">
      <section className="flex min-h-screen w-full flex-col">
        <Link
          href={`/student/${studentId}/classrooms`}
          className="mb-6 mt-10 inline-flex items-center gap-2 px-6 text-sm font-semibold text-[#9A9A9A] transition hover:text-[#555]"
        >
          <ArrowLeft size={18} />
          Back to Classrooms
        </Link>

        <section className="flex w-full items-center border-b border-[#E5E5E5] px-6 py-12">
          <div className="flex w-full flex-col gap-4 px-10">
            <h1 className="text-5xl font-bold text-[#9D9D9D]">
              {classroom.name}
            </h1>

            <p className="max-w-2xl text-base font-medium text-[#8F8F8F]">
              Your assessments are listed below. Complete them to build your
              learning path.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#BDBDBD]">
                Classroom Code
              </span>
              <span className="text-sm font-semibold text-[#7A7A7A]">
                {classroom.id}
              </span>
              <CopyClassroomCodeButton code={classroom.id} />
            </div>
          </div>
        </section>

        <section className="w-full bg-[#FAFAFA] px-6 py-12">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
            <div className="flex items-center justify-between gap-6">
              <div>
                <h2 className="mt-2 text-4xl font-extrabold text-[#8F8F8F]">
                  {activeTestId ? "Choose an Activity" : "Ready to Learn?"}
                </h2>
                <p className="mt-2 text-lg font-regular text-[#9A9A9A]">
                  {activeTestId
                    ? "Pick an activity to get started."
                    : "Choose a test and start your learning adventure!"}
                </p>
              </div>

              {activeTestId && (
                <button
                  type="button"
                  onClick={() => setActiveTestId(null)}
                  className="rounded-full border border-[#E5E5E5] bg-white px-5 py-2 text-sm font-semibold text-[#7A7A7A] transition hover:border-[#B0B0B0] hover:text-[#4F4F4F]"
                >
                  Back to Tests
                </button>
              )}
            </div>

            {!activeTestId && (
              <div className="grid gap-6 md:grid-cols-2">
                {assessments.map((test) => (
                  <button
                    key={test.id}
                    type="button"
                    onClick={() => setActiveTestId(test.id)}
                    className="group flex h-full flex-col justify-between rounded-2xl border border-[#E5E5E5] bg-[#F2F6D6] px-8 py-8 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#CFCFCF] hover:shadow-lg"
                  >
                    <div>
                      <p className="text-sm font-medium uppercase tracking-[0.3em] text-[#C5C5C5]">
                        {test.isInitial ? "Initial Assessment" : "Retest Assessment"}
                      </p>
                      <h3 className="mt-3 text-4xl font-extrabold text-[#7A7A7A] transition group-hover:text-[#2F855A]">
                        {test.title}
                      </h3>
                      <p className="mt-3 text-base font-medium text-[#9A9A9A]">
                        {test.description}
                      </p>
                    </div>
                    <span className="mt-8 inline-flex h-11 w-fit items-center justify-center rounded-md bg-[#29A177] px-6 text-base font-semibold text-white transition group-hover:bg-[#DFDC2F]">
                      View Test Types
                    </span>
                  </button>
                ))}
              </div>
            )}

            {activeTestId && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {testTypeCards.map((testType) => {
                  const activeAssessment = assessments.find((a) => a.id === activeTestId);
                  const isDone = activeAssessment?.results && activeAssessment.results[testType.id] !== null;

                  return (
                    <button
                      key={testType.id}
                      type="button"
                      disabled={isDone}
                      onClick={() =>
                        !isDone && router.push(`/student/${studentId}/classrooms/${classroomId}/test?testID=${encodeURIComponent(activeTestId)}&testtype=${encodeURIComponent(testType.id)}`)
                      }
                      className={`group relative overflow-hidden rounded-2xl border px-8 py-8 text-left shadow-sm transition duration-300 ${isDone ? "cursor-not-allowed border-gray-200 opacity-60" : "border-white/60 hover:-translate-y-1 hover:shadow-lg"}`}
                      style={{
                        background: isDone ? "#f0f0f0" : testType.background,
                        boxShadow: isDone ? "none" : `0 10px 30px ${testType.ring}`,
                      }}
                    >
                      <div className="relative z-10">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#5B5B5B]/70">
                          Activity Type
                        </p>
                        <h3 className="mt-3 text-2xl font-extrabold text-[#2F2F2F]">
                          {testType.title}
                        </h3>
                        <p className="mt-3 text-sm font-semibold text-[#4F4F4F]/80">
                          {isDone ? "Completed" : testType.description}
                        </p>
                      </div>

                      <div
                        className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-40"
                        style={{ backgroundColor: isDone ? "#ccc" : testType.accent }}
                      />
                      <div
                        className="absolute bottom-5 right-6 rounded-full px-4 py-1 text-lg font-semibold text-white"
                        style={{ backgroundColor: isDone ? "#999" : testType.accent }}
                      >
                        {isDone ? "Done" : "Start"}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}