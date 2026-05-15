"use client";

import {
  ArrowDownTrayIcon,
  DocumentPlusIcon,
} from "@heroicons/react/24/outline";

import type { Classification } from "@/types";

type ScoreRow = {
  key: string;
  label: string;
  score: number | null;
};

type Props = {
  student?: {
    id: string;
    name: string;
  } | null;

  classroom?: {
    id: string;
    name: string;
    student_count: number;
    variant: "yellow" | "green" | "blue" | "gray";
  } | null;

  classId?: string;
  studentId?: string;

  screening: {
    classification: Classification | null;
    created_at: string | null;
    scores: ScoreRow[];
    averageScore: number | null;
  };

  onGenerateLearningPath?: () => void;
};

function formatDate(value: string | null): string {
  if (!value) return "No screening date available";

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "No screening date available";
  }

  return parsed.toLocaleString("en-PH", {
    dateStyle: "long",
    timeStyle: "medium",
  });
}

export default function Performance({
  student,
  screening,
  onGenerateLearningPath,
}: Props) {
  const studentName = student?.name ?? "Student";
  const hasResults = screening.scores.length > 0;
  const isAtRisk = screening.classification === "AT-RISK";

  return (
    <section className="flex min-h-full w-full flex-col bg-[#F7F7F7] px-8 py-4">
      {/* Header */}
      <div className="shrink-0 border-t border-l border-r border-[#E7E7E7] bg-white px-8 py-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#29A177]">
            Personalized Learning Path
          </p>

          <h1 className="mt-2 text-4xl font-extrabold leading-none text-[#5C5E64]">
            {studentName}&apos;s Performance
          </h1>

          <p className="max-w-3xl text-base leading-7 text-[#8A8A8A]">
            A consolidated view of the learner&apos;s current numeracy
            performance, screening result, and recommended next learning action.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex w-full flex-1 gap-2 border border-[#E7E7E7] bg-white p-6">
        {/* LEFT CARD */}
        <div className="flex min-h-[520px] basis-[32%] flex-col border border-[#EDEDED] bg-[#F9F9F9]">
          {/* Screening Findings */}
          <div
            className={`flex min-h-[240px] px-10 py-10 text-start ${
              isAtRisk ? "bg-[#FFF0F0]" : "bg-[#ECF9F4]"
            }`}
          >
            <div className="flex max-w-md flex-col gap-3">
              <p className="text-lg font-semibold uppercase text-zinc-600">
                Screening Findings
              </p>

              <p
                className={`mt-3 text-4xl font-semibold leading-tight ${
                  isAtRisk ? "text-red-500" : "text-[#29A177]"
                }`}
              >
                {screening.classification === null
                  ? "No classification yet"
                  : screening.classification === "AT-RISK"
                  ? "At-Risk"
                  : "Typical"}
              </p>

              <div className="mt-2 flex flex-col text-sm text-[#5C5E64]">
                <span className="font-medium">Average Score:</span>
                <span className="font-light">
                  {screening.averageScore === null
                    ? "No score data"
                    : `${screening.averageScore}%`}
                </span>
              </div>

              <div className="mt-4 flex flex-col text-sm leading-none text-[#5C5E64]">
                <span className="font-medium">Event Time Indication:</span>
                <span className="mt-2 font-light">
                  {formatDate(screening.created_at)}
                </span>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex flex-1 px-10 py-10 text-start">
            <div className="flex w-full max-w-md flex-col gap-3">
              <p className="text-lg font-semibold uppercase text-zinc-600">
                Screening Examination Results
              </p>

              <button
                type="button"
                className="group flex h-14 w-72 items-center justify-center gap-3 rounded-lg bg-zinc-600 text-white shadow-sm transition-all duration-200 hover:bg-zinc-700 active:scale-[0.98]"
              >
                <ArrowDownTrayIcon className="h-5 w-5 transition-transform group-hover:translate-y-[1px]" />
                <span className="text-base font-semibold">
                  Download Result
                </span>
              </button>

              <div className="mt-2 space-y-2">
                {hasResults ? (
                  screening.scores.map((score) => (
                    <div
                      key={score.key}
                      className="flex items-center justify-between rounded-md border border-[#ECECEC] bg-white px-3 py-2 text-sm"
                    >
                      <span className="text-[#5C5E64]">{score.label}</span>

                      <span className="font-semibold text-[#29A177]">
                        {score.score === null ? "-" : `${score.score}%`}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#7A7A7A]">
                    No screening result yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT CARD */}
        <div className="flex min-h-[520px] basis-[68%] flex-col gap-5 border border-[#EDEDED] bg-[#F9F9F9] px-10">
          <div className="pt-10 text-lg font-semibold uppercase text-zinc-600">
            Description
          </div>

          <div className="text-lg font-light leading-snug text-[#5C5E64]">
            {screening.classification === null ? (
              <>
                No classifier description has been generated yet for this
                student. Once screening is complete, DysCalc will provide
                diagnostic guidance and a recommended support approach.
              </>
            ) : isAtRisk ? (
              <>
                The screening result indicates that {studentName} may need
                additional support in foundational numeracy skills. A
                personalized learning path can help provide targeted practice
                based on the student&apos;s screening performance.
              </>
            ) : (
              <>
                The screening result indicates that {studentName} is currently
                performing within the expected range. DysCalc may still provide
                enrichment activities to strengthen confidence and consistency.
              </>
            )}
          </div>

          <button
            type="button"
            onClick={onGenerateLearningPath}
            className="group mb-10 mt-auto flex h-14 w-72 items-center justify-center gap-3 rounded-lg bg-[#29A177] text-white shadow-sm transition-all duration-200 hover:bg-[#17815C] active:scale-[0.98]"
          >
            <DocumentPlusIcon className="h-5 w-5 transition-transform group-hover:translate-y-[1px]" />
            <span className="text-base font-semibold">
              Generate Learning Path
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}