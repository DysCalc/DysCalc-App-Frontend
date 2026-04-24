"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  EllipsisVerticalIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { classroomMap, studentsMap } from "../../../data";
import ScreeningInformation from "./ScreeningInformation";
import LearningPath from "./LearningPath";
import Performance from "./Performance";

type ActiveTab = "screening" | "learning" | "performance";

export default function StudentDetailPage() {
  const params = useParams();

  const classId = Array.isArray(params.classId)
    ? params.classId[0]
    : (params.classId as string);
  const studentId = Array.isArray(params.studentId)
    ? params.studentId[0]
    : (params.studentId as string);

  const classroom = classroomMap[classId as keyof typeof classroomMap];
  const studentList = studentsMap[classId as keyof typeof studentsMap] || [];
  const student = studentList.find((s) => s.id === studentId);

  const [activeTab, setActiveTab] = useState<ActiveTab>("screening");

  if (!classroom || !student) {
    return <div className="p-10">Student or classroom not found.</div>;
  }

  return (
    <div className="flex h-full w-full min-h-0 flex-col bg-neutral-50">
      {/* HEADER - 25% */}
      <div className="flex min-h-0 w-full flex-[25] items-center border-b border-[#D9D9D9] bg-[#F9F9F9] px-15">
        {/* Avatar */}
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-[#29A177] text-2xl font-semibold text-white">
          {student.name.charAt(0)}
        </div>

        {/* Text */}
        <div className="ml-5 flex flex-1 flex-col">
          <div className="text-4xl font-semibold text-[#5C5E64]">
            {student.name}
          </div>

          <div className="mt-2 flex gap-4 text-lg text-[#9D9D9D]">
            <p>
              #{classId} {classroom.title}
            </p>
            <p className="font-light">Student ID: {studentId}</p>
          </div>
        </div>
      </div>

      {/* TABS - 10% */}
      <div className="flex min-h-0 w-full flex-[5] border-b border-[#E5E5E5] bg-white px-15">
        <div className="flex w-full items-center justify-between">
          {/* LEFT: Tabs */}
          <div className="flex h-full items-center">
            <button
              onClick={() => setActiveTab("screening")}
              className={`h-full px-20 text-lg font-semibold transition ${activeTab === "screening"
                  ? "bg-[#F3F3F3] text-[#706F6F]"
                  : "text-[#9A9A9A] hover:bg-[#F8F8F8] hover:text-[#706F6F]"
                }`}
            >
              Screening Information
            </button>

            <button
              onClick={() => setActiveTab("learning")}
              className={`h-full px-20 text-lg font-semibold transition ${activeTab === "learning"
                  ? "bg-[#F3F3F3] text-[#706F6F]"
                  : "text-[#9A9A9A] hover:bg-[#F8F8F8] hover:text-[#706F6F]"
                }`}
            >
              Learning Path
            </button>

            <button
              onClick={() => setActiveTab("performance")}
              className={`h-full px-20 text-lg font-semibold transition ${activeTab === "performance"
                  ? "bg-[#F3F3F3] text-[#706F6F]"
                  : "text-[#9A9A9A] hover:bg-[#F8F8F8] hover:text-[#706F6F]"
                }`}
            >
              Performance
            </button>
          </div>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-2">
            <button className="flex h-10 w-10 items-center justify-center rounded-md text-[#7A7A7A] transition hover:bg-[#F1F1F1]">
              <EnvelopeIcon className="h-5 w-5" />
            </button>

            <button className="flex h-10 w-10 items-center justify-center rounded-md text-[#7A7A7A] transition hover:bg-[#F1F1F1]">
              <EllipsisVerticalIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT - 65% */}
      <div className="flex min-h-0 w-full flex-[65] overflow-hidden">
        {activeTab === "screening" && (
          <ScreeningInformation
            student={student}
            classroom={classroom}
            classId={classId}
            studentId={studentId}
            onGenerateLearningPath={() => setActiveTab("learning")}
          />
        )}

        {activeTab === "learning" && (
          <LearningPath
            student={student}
            classroom={classroom}
            classId={classId}
            studentId={studentId}
          />
        )}

        {/* {activeTab === "performance" && (
          <Performance
            student={student}
            classroom={classroom}
            classId={classId}
            studentId={studentId}
          />
        )} */}
      </div>
    </div>
  );
}