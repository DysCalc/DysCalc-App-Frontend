"use client";

import ArrowDownTrayIcon from "@heroicons/react/24/solid/esm/ArrowDownTrayIcon";
import { DocumentPlusIcon } from "@heroicons/react/24/outline";

type Props = {
  student: {
    id: string;
    name: string;
  };
  classroom: {
    id: string;
    title: string;
    students: number;
    variant: "yellow" | "green" | "blue" | "gray";
  };
  classId: string;
  studentId: string;
  onGenerateLearningPath?: () => void;
};

export default function ScreeningInformation({
  onGenerateLearningPath,
}: Props) {
  return (
    <div className="mt-2 mb-2 mr-2 flex w-full flex-2 gap-2 px-15">
      <div className="flex h-full w-full flex-3 flex-col border border-[#EDEDED] bg-[#F9F9F9]">
        <div className="flex flex-1 bg-[#FFF0F0] px-10 py-10 text-start">
          <div className="flex max-w-md flex-col gap-3">
            <p className="text-lg font-semibold uppercase text-zinc-600">
              Screening Findings
            </p>
            <p className="mt-3 text-4xl font-semibold leading-tight text-red-500 underline">
              High Risks
            </p>
            <div className="mt-4 flex flex-col text-sm leading-none text-[#5C5E64]">
              <span className="font-medium">Event Time Indication:</span>
              <span className="font-light">
                January 27, 2026 at 08:01:37 PM GMT+8
              </span>
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

            <div className="mt-4 flex flex-col text-sm leading-none text-[#5C5E64]">
              <span className="font-medium">Event Time Indication:</span>
              <span className="font-light">
                January 27, 2026 at 08:01:37 PM GMT+8
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-full w-full flex-7 flex-col border border-[#EDEDED] bg-[#F9F9F9] px-10 gap-5">
        <div className="pt-10 text-lg font-semibold uppercase text-zinc-600">
          Description
        </div>

        <div className="text-lg font-light leading-none">
          <span>
            The learner shows indicators associated with potential difficulties
            in foundational mathematical skills. This result is based on
            screening tasks and does not represent a medical diagnosis.
            <br />
            <br />
            It is recommended that the learner be referred to a qualified
            specialist (SPED teacher, educational psychologist, or psychiatrist)
            for further assessment. DysCalc will also provide a personalized
            learning support plan to help strengthen core numerical skills.
          </span>
        </div>

        <button
          onClick={onGenerateLearningPath}
          className="group flex h-14 w-72 items-center justify-center gap-3 rounded-lg bg-[#29A177] text-white shadow-sm transition-all duration-200 hover:bg-[#17815C] active:scale-[0.98]"
        >
          <DocumentPlusIcon className="h-5 w-5 transition-transform group-hover:translate-y-[1px]" />
          <span className="text-base font-semibold">
            Generate Learning Path
          </span>
        </button>
      </div>
    </div>
  );
}