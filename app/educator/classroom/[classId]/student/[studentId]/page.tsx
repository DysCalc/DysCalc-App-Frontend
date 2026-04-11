"use client";

import { useParams } from "next/navigation";
import { classroomMap, headerStyles, studentsMap } from "../../../data";
import ArrowDownTrayIcon from "@heroicons/react/24/solid/esm/ArrowDownTrayIcon";
import { DocumentPlusIcon, EllipsisVerticalIcon, EnvelopeIcon } from "@heroicons/react/24/outline";

export default function StudentDetailPage() {
  const params = useParams();

  const classId = params.classId as string;
  const studentId = params.studentId as string;

  const classroom = classroomMap[classId as keyof typeof classroomMap];
  const studentList = studentsMap[classId as keyof typeof studentsMap] || [];
  const student = studentList.find((s) => s.id === studentId);

  if (!classroom || !student) {
    return <div className="p-10">Student or classroom not found.</div>;
  }

  const styles = headerStyles[classroom.variant];

  return (
    <div className="flex h-full w-full flex-col bg-neutral-50">
        <div
        className={`flex w-full flex-1 items-center border-b border-[#D9D9D9] bg-[#F9F9F9] px-15 pt-15`}
        >
            {/* Avatar */}
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-[#29A177] text-2xl font-semibold text-white">
                {student.name.charAt(0)}
            </div>

            {/* Text */}
            <div className="ml-5 flex flex-1 flex-col gap-0">
                <div className={`text-5xl font-semibold text-[#5C5E64]`}>
                {student.name}
                </div>

                <div className={`mt-2 flex gap-4 text-lg text-[#9D9D9D]`}>
                    <p>#{classId} {classroom.title}</p>
                    <p className="font-light">Student ID: #{studentId}</p>
                </div>
            </div>
        </div>

        <div className="w-full border-b border-[#E5E5E5] bg-white px-15">
            <div className="flex items-center justify-between">
                
                {/* LEFT: Tabs */}
                <div className="flex items-center">
                    <button className="bg-[#F3F3F3] px-20 py-2 text-lg font-semibold text-[#706F6F]">
                        Screening Information
                    </button>

                    <button className="px-20 py-2 text-lg font-semibold text-[#9A9A9A] transition hover:bg-[#F8F8F8] hover:text-[#706F6F]">
                        Learning Path
                    </button>

                    <button className="px-20 py-2 text-lg font-semibold text-[#9A9A9A] transition hover:bg-[#F8F8F8] hover:text-[#706F6F]">
                        Performance
                    </button>
                    </div>

                    {/* RIGHT: Actions */}
                    <div className="flex items-center gap-2">
                    {/* Email */}
                    <button className="flex h-10 w-10 items-center justify-center rounded-md text-[#7A7A7A] transition hover:bg-[#F1F1F1]">
                        <EnvelopeIcon className="h-5 w-5" />
                    </button>

                    {/* Ellipsis */}
                    <button className="flex h-10 w-10 items-center justify-center rounded-md text-[#7A7A7A] transition hover:bg-[#F1F1F1]">
                        <EllipsisVerticalIcon className="h-5 w-5" />
                    </button>
                </div>

            </div>
        </div>

        <div className="flex w-full flex-2 mt-2 mb-2 mr-2 px-15 gap-2 ">
            <div className="flex h-full w-full flex-3 flex-col border border-[#EDEDED] bg-[#F9F9F9] ">

                <div className="flex flex-1 bg-[#FFF0F0] px-10 py-10 text-start">
                    <div className="flex max-w-md flex-col gap-3">
                        <p className="text-lg font-semibold uppercase text-zinc-600">Screening Findings</p>
                        <p className="mt-3 text-4xl font-semibold leading-tight text-red-500 underline">High Risks</p>
                        <div className="mt-4 flex flex-col text-sm text-[#5C5E64] leading-none ">
                            <span className="font-medium">
                            Event Time Indication:
                            </span>
                            <span className="font-light">
                            January 27, 2026 at 08:01:37 PM GMT+8
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-2 px-10 py-10 text-start">
                    <div className="flex max-w-md flex-col gap-3">
                        {/* Title */}
                        <p className="text-lg font-semibold uppercase text-zinc-600">
                            Screening Examination Results
                        </p>

                        {/* Button */}
                        <button className="group flex h-14 w-72 items-center justify-center gap-3 rounded-lg bg-zinc-600 text-white shadow-sm transition-all duration-200 hover:bg-zinc-700 active:scale-[0.98]">
                            <ArrowDownTrayIcon className="h-5 w-5 transition-transform group-hover:translate-y-[1px]" />
                            <span className="text-base font-semibold">Download Result</span>
                        </button>

                        {/* Timestamp */}
                        <div className="mt-4 flex flex-col text-sm text-[#5C5E64] leading-none ">
                            <span className="font-medium">
                            Event Time Indication:
                            </span>
                            <span className="font-light">
                            January 27, 2026 at 08:01:37 PM GMT+8
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex h-full w-full flex-7 flex-col bg-[#F9F9F9] flex-col border border-[#EDEDED] px-10 gap-5">
                <div className="justify-center text-zinc-600 text-lg font-semibold uppercase pt-10 ">Description</div>
                <div className="justify-center text-lg font-light leading-none">
                    <span>The learner shows indicators associated with potential difficulties in foundational mathematical skills. This result is based on screening tasks and does not represent a medical diagnosis.   It is recommended that the learner be referred to a qualified specialist (SPED teacher, educational psychologist, or psychiatrist) for further assessment. DysCalc will also provide a personalized learning support plan to help strengthen core numerical skills.</span>
                </div>
                <button className="group flex h-14 w-72 items-center justify-center gap-3 rounded-lg bg-[#29A177] text-white shadow-sm transition-all duration-200 hover:bg-[#17815C] active:scale-[0.98]">
                    <DocumentPlusIcon className="h-5 w-5 transition-transform group-hover:translate-y-[1px]" />
                    <span className="text-base font-semibold">Generate Learning Path</span>
                </button>
            </div>
        </div>
    </div>

  );
}