"use client";

import {
  ArrowTrendingUpIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  TrophyIcon,
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
};

const temporaryScores: ScoreRow[] = [
  {
    key: "number-comparison",
    label: "Number Comparison",
    score: 82,
  },
  {
    key: "digit-dot-matching",
    label: "Digit-Dot Matching",
    score: 74,
  },
  {
    key: "number-series",
    label: "Number Series",
    score: 58,
  },
  {
    key: "single-digit-addition",
    label: "Single-Digit Addition",
    score: 69,
  },
  {
    key: "single-digit-subtraction",
    label: "Single-Digit Subtraction",
    score: 46,
  },
  {
    key: "multi-digit-calculation",
    label: "Multi-Digit Calculation",
    score: 39,
  },
];

function clampScore(score: number) {
  return Math.min(Math.max(score, 0), 100);
}

function getRemark(score: number) {
  if (score >= 80) {
    return {
      label: "Strong",
      textClass: "text-[#29A177]",
      barClass: "bg-[#29A177]",
      softClass: "bg-[#ECF9F4]",
      borderClass: "border-[#CBEFE0]",
    };
  }

  if (score >= 65) {
    return {
      label: "Improving",
      textClass: "text-blue-600",
      barClass: "bg-blue-500",
      softClass: "bg-blue-50",
      borderClass: "border-blue-100",
    };
  }

  if (score >= 50) {
    return {
      label: "Emerging",
      textClass: "text-[#C99A00]",
      barClass: "bg-[#FFCC00]",
      softClass: "bg-[#FFF8D9]",
      borderClass: "border-[#FFE680]",
    };
  }

  return {
    label: "Needs Support",
    textClass: "text-red-500",
    barClass: "bg-red-400",
    softClass: "bg-red-50",
    borderClass: "border-red-100",
  };
}

function getAchievementLabel(classification: Classification | null) {
  if (classification === "TYPICAL") return "On Track";
  if (classification === "AT-RISK") return "Needs Support";
  return "Pending";
}

function getAchievementColor(classification: Classification | null) {
  if (classification === "TYPICAL") return "text-[#29A177]";
  if (classification === "AT-RISK") return "text-red-500";
  return "text-[#9A9A9A]";
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export default function Performance({ student, screening }: Props) {
  const studentName = student?.name ?? "Student";

  const sourceScores =
    screening.scores.length > 0 ? screening.scores : temporaryScores;

  const rows = sourceScores
    .filter((score) => score.score !== null)
    .map((score) => ({
      id: score.key,
      skill: score.label,
      score: score.score as number,
    }));

  const isUsingTemporaryData = screening.scores.length === 0;

  const overall =
    screening.averageScore ??
    (rows.length
      ? rows.reduce((total, row) => total + row.score, 0) / rows.length
      : 0);

  const classification =
    screening.classification ?? (overall >= 65 ? "TYPICAL" : "AT-RISK");

  const strongestRow = rows.length
    ? rows.reduce((best, current) =>
        current.score > best.score ? current : best
      )
    : null;

  const lowestRow = rows.length
    ? rows.reduce((lowest, current) =>
        current.score < lowest.score ? current : lowest
      )
    : null;

  const strongest = strongestRow?.score ?? 0;
  const lowest = lowestRow?.score ?? 0;
  const skillGap = strongest - lowest;
  const improvementTarget = Math.max(0, 100 - overall);

  const performanceCards = [
    {
      id: "overall",
      label: "Overall Accuracy",
      value: formatPercent(overall),
      helper: "Average screening score",
      icon: ChartBarIcon,
      iconClass: "bg-blue-50 text-blue-600",
    },
    {
      id: "target",
      label: "Improvement Target",
      value: formatPercent(improvementTarget),
      helper: "Distance from full mastery",
      icon: ArrowTrendingUpIcon,
      iconClass: "bg-[#ECF9F4] text-[#29A177]",
    },
    {
      id: "achievement",
      label: "Achievement Level",
      value: getAchievementLabel(classification),
      helper: "Based on latest screening",
      icon: TrophyIcon,
      iconClass: "bg-[#FFF8D9] text-[#C99A00]",
    },
  ];

  return (
    <section className="flex h-full min-h-0 w-full flex-col bg-[#F7F7F7] px-8 py-4">
      {/* Header */}
      <div className="shrink-0 border-t border-l border-r border-[#E7E7E7] bg-white px-8 py-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#29A177]">
            Performance Overview
          </p>

          <h1 className="mt-2 text-4xl font-extrabold leading-none text-[#5C5E64]">
            {studentName}&apos;s Performance Snapshot
          </h1>

          <p className="max-w-3xl text-base leading-7 text-[#8A8A8A]">
            A consolidated view of the learner&apos;s screening performance,
            skill strengths, support areas, and recommended next learning
            action.
          </p>

          {isUsingTemporaryData && (
            <div className="mt-4 inline-flex rounded-full bg-[#FFF8D9] px-4 py-1 text-xs font-bold text-[#C99A00]">
              Preview Mode: Temporary sample data shown
            </div>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="min-h-0 flex-1 overflow-y-auto border border-[#E7E7E7] bg-white p-4">
        <div className="flex flex-col gap-4">
          {/* Metric Cards */}
          <div className="grid gap-4 lg:grid-cols-3">
            {performanceCards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.id}
                  className="border border-[#E7E7E7] bg-white px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-[#BDBDBD]">
                        {card.label}
                      </p>

                      <p
                        className={`mt-2 text-2xl font-extrabold leading-none ${
                          card.id === "achievement"
                            ? getAchievementColor(classification)
                            : "text-[#5C5E64]"
                        }`}
                      >
                        {card.value}
                      </p>

                      <p className="mt-2 text-xs font-medium text-[#9A9A9A]">
                        {card.helper}
                      </p>
                    </div>

                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${card.iconClass}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Graph Section */}
          <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
            {/* Skill Performance Area Plot */}
            <div className="border border-[#E7E7E7] bg-white">
              <div className="border-b border-[#EFEFEF] px-4 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-extrabold uppercase tracking-wide text-[#696969]">
                      Skill Performance Area Plot
                    </p>

                    <p className="mt-1 text-xs font-medium text-[#9A9A9A]">
                      Circle size represents each numeracy skill score
                      proportionally.
                    </p>
                  </div>

                  <div className="rounded-full bg-[#ECF9F4] px-4 py-1 text-xs font-extrabold text-[#29A177]">
                    {rows.length} Skills
                  </div>
                </div>
              </div>

              <div className="px-4 py-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {rows.map((row) => {
                    const value = clampScore(row.score);
                    const remark = getRemark(row.score);
                    const circleSize = 54 + value * 0.7;

                    return (
                      <div
                        key={row.id}
                        className={`flex min-h-[220px] flex-col items-center justify-center border px-4 py-4 text-center ${remark.softClass} ${remark.borderClass}`}
                      >
                        <div
                          className={`flex items-center justify-center rounded-full text-xl font-extrabold text-white shadow-sm ${remark.barClass}`}
                          style={{
                            width: `${circleSize}px`,
                            height: `${circleSize}px`,
                          }}
                        >
                          {row.score.toFixed(0)}%
                        </div>

                        <p className="mt-4 line-clamp-2 text-sm font-extrabold leading-5 text-[#5C5E64]">
                          {row.skill}
                        </p>

                        <p
                          className={`mt-2 text-xs font-bold ${remark.textClass}`}
                        >
                          {remark.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Overall Score Ring */}
            <div className="border border-[#E7E7E7] bg-white px-4 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-extrabold uppercase tracking-wide text-[#696969]">
                    Overall Score
                  </p>

                  <p className="mt-1 text-xs font-medium text-[#9A9A9A]">
                    Summary of the learner&apos;s average screening
                    performance.
                  </p>
                </div>

                <ChartBarIcon className="h-6 w-6 text-[#29A177]" />
              </div>

              <div className="mt-6 flex min-h-[260px] items-center justify-center">
                <div className="relative flex h-52 w-52 items-center justify-center rounded-full bg-[#EFEFEF]">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `conic-gradient(#29A177 ${
                        clampScore(overall) * 3.6
                      }deg, #EFEFEF 0deg)`,
                    }}
                  />

                  <div className="relative flex h-40 w-40 flex-col items-center justify-center rounded-full bg-white">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[#BDBDBD]">
                      Average
                    </p>

                    <p className="mt-2 text-4xl font-extrabold leading-none text-[#5C5E64]">
                      {overall.toFixed(0)}%
                    </p>

                    <p
                      className={`mt-2 text-xs font-bold ${getAchievementColor(
                        classification
                      )}`}
                    >
                      {getAchievementLabel(classification)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="border border-[#E7E7E7] bg-white px-4 py-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#ECF9F4] text-[#29A177]">
                      <TrophyIcon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-[#BDBDBD]">
                        Strongest Skill
                      </p>

                      <p className="mt-2 truncate text-sm font-extrabold text-[#5C5E64]">
                        {strongestRow?.skill ?? "No data"}
                      </p>

                      <p className="mt-1 text-xl font-extrabold leading-none text-[#29A177]">
                        {strongestRow ? formatPercent(strongestRow.score) : "-"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border border-[#E7E7E7] bg-white px-4 py-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500">
                      <ExclamationTriangleIcon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-[#BDBDBD]">
                        Priority Support
                      </p>

                      <p className="mt-2 truncate text-sm font-extrabold text-[#5C5E64]">
                        {lowestRow?.skill ?? "No data"}
                      </p>

                      <p className="mt-1 text-xl font-extrabold leading-none text-red-500">
                        {lowestRow ? formatPercent(lowestRow.score) : "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 border border-[#E7E7E7] bg-[#FAFAFA] px-4 py-4">
                <p className="text-sm font-extrabold uppercase tracking-wide text-[#696969]">
                  Performance Interpretation
                </p>

                <p className="mt-3 text-sm leading-6 text-[#7A7A7A]">
                  {classification === "AT-RISK" ? (
                    <>
                      {studentName} may need targeted support, especially in{" "}
                      <span className="font-extrabold text-red-500">
                        {lowestRow?.skill}
                      </span>
                      . The current gap between strongest and weakest skill is{" "}
                      <span className="font-extrabold text-[#5C5E64]">
                        {formatPercent(skillGap)}
                      </span>
                      .
                    </>
                  ) : (
                    <>
                      {studentName} is currently on track. The strongest area is{" "}
                      <span className="font-extrabold text-[#29A177]">
                        {strongestRow?.skill}
                      </span>
                      , while{" "}
                      <span className="font-extrabold text-[#5C5E64]">
                        {lowestRow?.skill}
                      </span>{" "}
                      may still be used for reinforcement.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Table */}
          <div className="border border-[#E7E7E7] bg-white">
            <div className="border-b border-[#EFEFEF] px-4 py-4">
              <p className="text-sm font-extrabold uppercase tracking-wide text-[#696969]">
                Detailed Skill Breakdown
              </p>

              <p className="mt-1 text-xs font-medium text-[#9A9A9A]">
                Tabular view of each skill area, score, and performance status.
              </p>
            </div>

            <div className="grid grid-cols-3 bg-[#FAFAFA] px-4 py-3 text-xs font-bold uppercase tracking-wide text-[#9A9A9A]">
              <div>Skill Area</div>
              <div>Score</div>
              <div>Status</div>
            </div>

            {rows.map((row) => {
              const value = clampScore(row.score);
              const remark = getRemark(row.score);

              return (
                <div
                  key={row.id}
                  className="grid grid-cols-3 items-center border-t border-[#F0F0F0] px-4 py-4 text-sm transition hover:bg-[#FAFAFA]"
                >
                  <div className="font-medium text-[#5C5E64]">
                    {row.skill}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="w-14 font-extrabold text-[#5C5E64]">
                      {formatPercent(row.score)}
                    </span>

                    <div className="h-2 w-full max-w-[160px] rounded-full bg-[#ECECEC]">
                      <div
                        className={`h-full rounded-full ${remark.barClass}`}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>

                  <div className={`font-extrabold ${remark.textClass}`}>
                    {remark.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}