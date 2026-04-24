"use client";

import {
  ArrowTrendingUpIcon,
  ChartBarIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";

type Props = {
  student: {
    id: string;
    name: string;
  };
};

const performanceCards = [
  {
    id: "pf_001",
    label: "Overall Accuracy",
    value: "78%",
    icon: ChartBarIcon,
    color: "bg-blue-50 text-blue-600",
  },
  {
    id: "pf_002",
    label: "Improvement Rate",
    value: "+12%",
    icon: ArrowTrendingUpIcon,
    color: "bg-green-50 text-green-600",
  },
  {
    id: "pf_003",
    label: "Achievement Level",
    value: "Developing",
    icon: TrophyIcon,
    color: "bg-yellow-50 text-yellow-600",
  },
];

const recentResults = [
  {
    id: "r1",
    skill: "Number Recognition",
    score: 85,
  },
  {
    id: "r2",
    skill: "Counting Sequence",
    score: 73,
  },
  {
    id: "r3",
    skill: "Basic Addition",
    score: 64,
  },
  {
    id: "r4",
    skill: "Subtraction Readiness",
    score: 58,
  },
];

function getRemark(score: number) {
  if (score >= 80) return { label: "Strong", color: "text-green-600" };
  if (score >= 65) return { label: "Improving", color: "text-blue-600" };
  if (score >= 50) return { label: "Emerging", color: "text-yellow-600" };
  return { label: "Needs Support", color: "text-red-600" };
}

export default function Performance({ student }: Props) {
  return (
    <div className="flex h-full w-full flex-col gap-4 px-15 py-4 min-h-0">

      {/* HEADER / SUMMARY */}
      <div className="rounded border border-[#EDEDED] bg-white px-10 py-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Performance Overview
        </p>

        <h2 className="mt-2 text-3xl font-semibold text-[#5C5E64] leading-tight">
          {student.name}'s Performance Snapshot
        </h2>

        <p className="mt-2 max-w-2xl text-sm text-[#7A7A7A]">
          A consolidated view of the learner’s current numeracy performance,
          highlighting accuracy, improvement trends, and skill-level mastery.
        </p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-3 gap-4">
        {performanceCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.id}
              className="rounded border border-[#EDEDED] bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center justify-between">

                {/* TEXT */}
                <div>
                  <p className="text-xs font-medium text-[#9A9A9A] uppercase tracking-wide">
                    {card.label}
                  </p>

                  <p className="mt-2 text-3xl font-semibold text-[#5C5E64]">
                    {card.value}
                  </p>
                </div>

                {/* ICON */}
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded ${card.color}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* TABLE */}
      <div className="flex flex-1 min-h-0 flex-col rounded border border-[#EDEDED] bg-white shadow-sm">

        {/* HEADER */}
        <div className="px-6 py-5 border-b border-[#EEEEEE]">
          <p className="text-sm font-semibold uppercase text-zinc-500">
            Skill Breakdown
          </p>
        </div>

        {/* TABLE BODY (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto">

          {/* TABLE HEADER */}
          <div className="grid grid-cols-3 px-6 py-3 text-xs font-semibold uppercase text-[#9A9A9A] bg-[#FAFAFA]">
            <div>Skill Area</div>
            <div>Score</div>
            <div>Status</div>
          </div>

          {/* ROWS */}
          {recentResults.map((row) => {
            const remark = getRemark(row.score);

            return (
              <div
                key={row.id}
                className="grid grid-cols-3 items-center px-6 py-4 text-sm border-t border-[#F0F0F0] hover:bg-[#FAFAFA] transition"
              >
                <div className="font-medium text-[#5C5E64]">
                  {row.skill}
                </div>

                {/* SCORE + BAR */}
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-[#5C5E64]">
                    {row.score}%
                  </span>

                  <div className="h-2 w-full max-w-[120px] bg-[#ECECEC] rounded-full">
                    <div
                      className="h-full bg-[#29A177] rounded-full"
                      style={{ width: `${row.score}%` }}
                    />
                  </div>
                </div>

                {/* STATUS */}
                <div className={`font-semibold ${remark.color}`}>
                  {remark.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}