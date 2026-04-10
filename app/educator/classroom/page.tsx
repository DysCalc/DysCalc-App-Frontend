"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ClassCard from "@/components/educator/ClassCard";

type ClassItem = {
  title: string;
  students: number;
  variant: "yellow" | "green" | "blue" | "gray";
};

const MAX_CLASSES = 6;

export default function EducatorClassroom() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassItem[]>([
    { title: "2023 SpEd Iligan City", students: 8, variant: "yellow" },
    { title: "2025 SpEd Lanao del Norte", students: 21, variant: "green" },
    { title: "Class 3", students: 10, variant: "blue" },
    { title: "Class 4", students: 15, variant: "green" },
    { title: "Class 5", students: 24, variant: "yellow" },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [classroomName, setClassroomName] = useState("");

  const openCreateModal = () => {
    if (classes.length >= MAX_CLASSES) return;
    setShowModal(true);
  };

  const closeCreateModal = () => {
    setShowModal(false);
    setClassroomName("");
  };

  const handleCreateClass = () => {
    const trimmedName = classroomName.trim();

    if (!trimmedName || classes.length >= MAX_CLASSES) return;

    const colorCycle: ClassItem["variant"][] = ["green", "blue", "yellow", "gray"];
    const nextVariant = colorCycle[classes.length % colorCycle.length];

    const newClass: ClassItem = {
      title: trimmedName,
      students: 0,
      variant: nextVariant,
    };

    setClasses([...classes, newClass]);
    closeCreateModal();
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
            onClick={openCreateModal}
            className="inline-flex items-center justify-center rounded-md bg-[#29A177] px-15 py-3 text-lg font-medium text-white shadow-sm transition duration-200 hover:bg-[#018255] hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={classes.length >= MAX_CLASSES}
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
              onClick={() => router.push(`/educator/classroom/${cls.title}`)}
              onMenuClick={() => console.log(`${cls.title} menu clicked`)}
            />
          ))}

          {classes.length < MAX_CLASSES && (
            <ClassCard
              variant="empty"
              onClick={openCreateModal}
            />
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5">
              <h2 className="text-3xl font-semibold text-[#6C6C6C]">
                Create Classroom
              </h2>
              <p className="mt-1 text-base text-neutral-500">
                Enter a classroom name.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="classroom-name"
                className="text-sm font-medium text-[#6C6C6C]"
              >
                Name
              </label>

              <input
                id="classroom-name"
                type="text"
                value={classroomName}
                onChange={(e) => setClassroomName(e.target.value)}
                placeholder="Enter classroom name"
                className="rounded-lg border border-[#D9D9D9] px-4 py-3 text-base text-[#6C6C6C] outline-none transition focus:border-[#29A177] focus:ring-2 focus:ring-[#29A177]/20"
                autoFocus
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={closeCreateModal}
                className="rounded-lg border border-[#D9D9D9] px-4 py-2 text-sm font-medium text-[#6C6C6C] transition hover:bg-neutral-50"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateClass}
                className="rounded-lg bg-[#29A177] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#018255] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!classroomName.trim()}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}