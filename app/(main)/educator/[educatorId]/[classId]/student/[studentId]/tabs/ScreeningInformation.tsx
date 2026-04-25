"use client";

import { ArrowDownTrayIcon, DocumentPlusIcon } from "@heroicons/react/24/outline";

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
    students: number;
    variant: "yellow" | "green" | "blue" | "gray";
  };
  classId: string;
  studentId: string;
  screening: {
    classification: "TYPICAL" | "AT-RISK" | null;
    prompt: string | null;
    created_at: string | null;
    scores: ScoreRow[];
    averageScore: number | null;
  };
  onGenerateLearningPath?: () => void;
};

function formatDate(value: string | null): string {
  if (!value) return "No screening date available";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "No screening date available";

  return parsed.toLocaleString("en-PH", {
    dateStyle: "long",
    timeStyle: "medium",
  });
}

export default function ScreeningInformation({
  screening,
  onGenerateLearningPath,
}: Props) {
  const hasResults = screening.scores.length > 0;
  const isAtRisk = screening.classification === "AT-RISK";

  return (
    <div className="mt-2 mb-2 mr-2 flex w-full flex-2 gap-2 px-15">
      <div className="flex h-full w-full flex-3 flex-col border border-[#EDEDED] bg-[#F9F9F9]">
        <div
          className={`flex flex-1 px-10 py-10 text-start ${
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
              <span className="font-light">{formatDate(screening.created_at)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-2 px-10 py-10 text-start">
          <div className="flex max-w-md flex-col gap-3">
            <p className="text-lg font-semibold uppercase text-zinc-600">
              Screening Examination Results
            </p>

            <button className="group flex h-14 w-72 items-center justify-center gap-3 rounded-lg bg-zinc-600 text-white shadow-sm transition-all duration-200 hover:bg-zinc-700 active:scale-[0.98]">
              <ArrowDownTrayIcon className="h-5 w-5 transition-transform group-hover:translate-y-[1px]" />
              <span className="text-base font-semibold">Download Result</span>
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
                <p className="text-sm text-[#7A7A7A]">No screening result yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-full w-full flex-7 flex-col border border-[#EDEDED] bg-[#F9F9F9] px-10 gap-5">
        <div className="pt-10 text-lg font-semibold uppercase text-zinc-600">
          Description
        </div>

        <div className="text-lg font-light leading-snug text-[#5C5E64]">
          {screening.prompt ||
            "No classifier description has been generated yet for this student. Once screening is complete, DysCalc will provide diagnostic guidance and a recommended support approach."}
        </div>

        <button
          onClick={onGenerateLearningPath}
          className="group mt-auto mb-10 flex h-14 w-72 items-center justify-center gap-3 rounded-lg bg-[#29A177] text-white shadow-sm transition-all duration-200 hover:bg-[#17815C] active:scale-[0.98]"
        >
          <DocumentPlusIcon className="h-5 w-5 transition-transform group-hover:translate-y-[1px]" />
          <span className="text-base font-semibold">Generate Learning Path</span>
        </button>
      </div>
    </div>
  );
}
