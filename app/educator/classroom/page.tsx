"use client";

import { useState } from "react";
import ClassCard from "@/components/educator/ClassCard";

type ClassItem = {
  title: string;
  students: number;
  variant: "yellow" | "green" | "blue" | "gray";
};

const MAX_CLASSES = 6;

export default function EducatorClassroom() {
  const [classes, setClasses] = useState<ClassItem[]>([
    { title: "2023 SpEd Iligan City", students: 8, variant: "yellow" },
    { title: "2025 SpEd Lanao del Norte", students: 21, variant: "green" },
    { title: "Class 3", students: 10, variant: "blue" },
    { title: "Class 4", students: 15, variant: "green" },
    { title: "Class 5", students: 24, variant: "yellow" },
  ]);

  const handleAddClass = () => {
    if (classes.length >= MAX_CLASSES) return;

    const newClass: ClassItem = {
      title: `New Class ${classes.length + 1}`,
      students: 0,
      variant: "gray",
    };

    setClasses([...classes, newClass]);
  };

  return (
    <div className="flex h-full w-full flex-col items-center">
      <div className="flex h-full w-full flex-2 items-center justify-end border-b border-[#D9D9D9] bg-neutral-50 pt-15">
        <div className="flex flex-1 flex-col items-start gap-0 bg-neutral-50 px-15">
          <div className="text-5xl font-semibold text-neutral-600">
            Juan Dela Cruz
          </div>

          <div className="flex-1 text-lg font-light text-neutral-600">
            Special Education Teacher / Adviser
          </div>
        </div>

        <div className="flex flex-1 flex-col items-end bg-neutral-10 px-15">
          <button
            onClick={handleAddClass}
            className="inline-flex items-center justify-center rounded-md bg-[#29A177] px-15 py-3 text-lg font-medium text-white shadow-sm transition duration-200 hover:bg-[#018255] hover:shadow-md active:scale-95"
          >
            Create a Class
          </button>
        </div>
      </div>

      <div className="flex h-full w-full flex-5 gap-3">
        <div className="grid h-full w-full grid-cols-3 grid-rows-2 gap-5 p-15 pb-55">
          {classes.map((cls, index) => (
            <ClassCard
              key={index}
              title={cls.title}
              students={cls.students}
              variant={cls.variant}
              onClick={() => console.log(`${cls.title} clicked`)}
              onMenuClick={() => console.log(`${cls.title} menu clicked`)}
            />
          ))}

          {classes.length < MAX_CLASSES && (
            <ClassCard
              variant="empty"
              onClick={handleAddClass}
            />
          )}
        </div>
      </div>
    </div>
  );
}