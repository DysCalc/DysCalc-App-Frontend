"use client";

import { useMemo, useState } from "react";
import {
  ArrowPathRoundedSquareIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

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
};

type LearningModule = {
  id: string;
  title: string;
  description: string;
  status: "Completed" | "In Progress" | "Not Started";
  progress: number;
};

function toLearningModules(scores: ScoreRow[]): LearningModule[] {
  const mapped = scores
    .filter((score) => score.score !== null)
    .sort((a, b) => (a.score ?? 0) - (b.score ?? 0))
    .map((score, index) => {
      const value = score.score ?? 0;
      let status: LearningModule["status"] = "Not Started";

      if (value >= 85) status = "Completed";
      else if (value >= 55) status = "In Progress";

      return {
        id: score.key,
        title: score.label,
        description:
          status === "Completed"
            ? "Maintain mastery through spaced practice and quick checks."
            : status === "In Progress"
              ? "Strengthen understanding with guided repetition and scaffolded tasks."
              : "Prioritize intervention with concrete visuals and short daily sessions.",
        status,
        progress: Number(value.toFixed(1)),
      };
    });

  if (mapped.length) return mapped;

  return [
    {
      id: "foundation",
      title: "Numeracy Foundations",
      description:
        "No screening metrics were found yet. Start with foundational number sense activities while waiting for the initial test results.",
      status: "Not Started",
      progress: 0,
    },
  ];
}

export default function LearningPath({ student, screening }: Props) {
  const modules = useMemo(() => toLearningModules(screening.scores), [screening.scores]);
  const [activeModuleId, setActiveModuleId] = useState(modules[0].id);

  const activeModule = useMemo(
    () => modules.find((module) => module.id === activeModuleId) ?? modules[0],
    [activeModuleId, modules]
  );

  return (
    <div className="mt-2 mb-2 mr-2 flex h-[600px] w-full min-h-0 flex-col gap-4 px-15 py-4">
      <div className="shrink-0 rounded border border-[#EDEDED] bg-white px-10 py-4 shadow-sm">
        <div className="flex items-start justify-between gap-6">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Personalized Learning Path
            </p>

            <h2 className="text-2xl font-semibold text-[#5C5E64] leading-tight">
              Recommended interventions for {student.name}
            </h2>
          </div>

          <button className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#29A177] px-6 text-white shadow-sm transition hover:bg-[#17815C] active:scale-[0.98]">
            <ArrowPathRoundedSquareIcon className="h-5 w-5" />
            <span className="text-sm font-semibold">Refresh Path</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 w-full gap-4">
        <div className="flex min-h-0 flex-[3] flex-col overflow-hidden rounded border border-[#EDEDED] bg-white shadow-sm">
          <div className="shrink-0 border-b border-[#EEEEEE] px-6 py-4">
            <p className="text-lg font-semibold uppercase text-zinc-600">Modules</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {modules.map((module, index) => {
              const isActive = activeModule.id === module.id;

              return (
                <button
                  key={module.id}
                  type="button"
                  onClick={() => setActiveModuleId(module.id)}
                  className={`w-full border-b border-[#F0F0F0] px-5 py-4 text-left transition ${
                    isActive ? "bg-[#F3F8F5]" : "bg-white hover:bg-[#F8F8F8]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold ${
                        isActive
                          ? "bg-[#29A177] text-white"
                          : "bg-[#EAF6F1] text-[#29A177]"
                      }`}
                    >
                      {index + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`truncate text-sm font-semibold ${
                            isActive ? "text-[#29A177]" : "text-[#5C5E64]"
                          }`}
                        >
                          {module.title}
                        </p>

                        <span className="shrink-0 text-xs font-medium text-[#7A7A7A]">
                          {module.progress}%
                        </span>
                      </div>

                      <p className="mt-1 line-clamp-2 text-xs font-light leading-relaxed text-[#7A7A7A]">
                        {module.description}
                      </p>

                      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#ECECEC]">
                        <div
                          className="h-full rounded-full bg-[#29A177]"
                          style={{ width: `${module.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex min-h-0 flex-[7] flex-col overflow-hidden rounded border border-[#EDEDED] bg-white shadow-sm">
          <div className="flex-1 overflow-y-auto px-8 py-8">
            <div className="flex items-start justify-between gap-4">
              <div className="max-w-3xl">
                <p className="text-lg font-semibold uppercase text-zinc-600">
                  Module Details
                </p>
                <h3 className="mt-3 text-3xl font-semibold text-[#5C5E64]">
                  {activeModule.title}
                </h3>
                <p className="mt-3 text-base font-light leading-relaxed text-[#5C5E64]">
                  {activeModule.description}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2 rounded-md bg-[#F8F8F8] px-3 py-2 text-sm text-[#5C5E64]">
                {activeModule.status === "Completed" ? (
                  <CheckCircleIcon className="h-4 w-4 text-[#29A177]" />
                ) : (
                  <ClockIcon className="h-4 w-4 text-[#9A9A9A]" />
                )}
                <span className="font-medium">{activeModule.status}</span>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-[#EEEEEE] bg-[#FAFAFA] p-5">
                <p className="text-sm font-medium text-[#7A7A7A]">Progress</p>
                <p className="mt-2 text-3xl font-semibold text-[#29A177]">
                  {activeModule.progress}%
                </p>

                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[#ECECEC]">
                  <div
                    className="h-full rounded-full bg-[#29A177]"
                    style={{ width: `${activeModule.progress}%` }}
                  />
                </div>
              </div>

              <div className="rounded-lg border border-[#EEEEEE] bg-[#FAFAFA] p-5">
                <p className="text-sm font-medium text-[#7A7A7A]">Recommended Frequency</p>
                <p className="mt-2 text-2xl font-semibold text-[#5C5E64]">3 sessions / week</p>
                <p className="mt-2 text-sm font-light leading-relaxed text-[#7A7A7A]">
                  Keep sessions short and focused, especially on the lowest-scoring domains.
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-lg border border-[#EEEEEE] bg-[#FAFAFA] p-6">
              <p className="text-lg font-semibold uppercase text-zinc-600">Notes for Facilitators</p>
              <p className="mt-3 text-sm font-light leading-relaxed text-[#5C5E64]">
                Classification: {screening.classification ?? "Not yet available"}. Start each
                session with a quick warm-up and focus on one core competency at a time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
