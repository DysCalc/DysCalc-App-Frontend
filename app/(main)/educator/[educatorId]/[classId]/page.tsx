"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import StudentCard from "@/components/educator/StudentCard";
import { headerStyles } from "../classroom/data";
import { studentsMap } from "../classroom/data";
import { classroomMap } from "../classroom/data";

export default function ClassroomPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.classId as string;
  const classroom = classroomMap[classId as keyof typeof classroomMap];
  const studentList = studentsMap[classId as keyof typeof studentsMap] || [];
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const styles = headerStyles[classroom.variant];

  return (
    <div className="flex h-full w-full flex-col">
      {/* HEADER */}
      <div
        className={`flex w-full flex-1 items-center border-b border-[#D9D9D9] pt-15 ${styles.bg}`}
      >
        <div className="flex flex-1 flex-col items-start px-15">
          <div className={`text-5xl font-semibold ${styles.title}`}>
            {classroom.title}
          </div>

          <div className={`mt-2 text-lg font-light ${styles.sub}`}>
            {classroom.students}{" "}
            {Number(classroom.students) === 1 ? "student" : "students"}
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="w-full border-b border-[#E5E5E5] bg-white px-15">
        <div className="flex items-center">
          <button className="bg-[#F3F3F3] px-10 py-2 text-lg font-semibold text-[#706F6F]">
            Students
          </button>

          <button className="px-10 py-2 text-lg font-semibold text-[#9A9A9A] transition hover:bg-[#F8F8F8] hover:text-[#706F6F]">
            Notifications
          </button>
        </div>
      </div>

      {/* STUDENT GRID */}
      <div className="flex flex-1 w-full">
        <div className="grid w-full grid-cols-3 grid-rows-4 gap-2 p-15 pb-55">
          {studentList.map((student) => {
            const isOpen = openMenuId === student.id;

            return (
              <StudentCard
                key={student.id}
                student={student}
                isOpen={isOpen}
                onToggle={(id) =>
                  setOpenMenuId((prev) => (prev === id ? null : id))
                }
                onClose={() => setOpenMenuId(null)}
                onClick={(id) => {
                  // Handle student click event
                  router.push(`/educator/classroom/${classId}/student/${id}`)
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}