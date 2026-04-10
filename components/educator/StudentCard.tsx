"use client";

import {
    ChartBarIcon,
  EllipsisVerticalIcon,
  EnvelopeIcon,
  InformationCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

type Student = {
  id: string;
  name: string;
};

type Props = {
  student: Student;
  isOpen: boolean;
  onToggle: (id: string) => void;
  onClose: () => void;
};

export default function StudentCard({
  student,
  isOpen,
  onToggle,
  onClose,
}: Props) {
  return (
    <div
      onMouseLeave={onClose}
      className="group relative flex items-center rounded border border-[#D9D9D9] bg-white px-3 py-2 transition hover:bg-[#F8F8F8]"
    >
      {/* Avatar */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#29A177] text-base font-semibold text-white">
        {student.name.charAt(0)}
      </div>

      {/* Name */}
      <span className="ml-2 flex-1 truncate text-base text-[#4A4A4A]">
        {student.name}
      </span>

      {/* Action area */}
      <div className="relative ml-2 flex shrink-0 items-center">
        {/* Dropdown */}
        <div
          className={`
            absolute right-10 top-1/2 z-20 flex -translate-y-1/2 flex-col overflow-hidden rounded-lg border border-[#D9D9D9] bg-white shadow-md
            transition-all duration-200 ease-out
            ${
              isOpen
                ? "max-h-40 opacity-100 translate-x-0"
                : "pointer-events-none max-h-0 opacity-0 translate-x-2"
            }
          `}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log(`${student.name} information clicked`);
              onClose();
            }}
            className="flex items-center gap-2 px-3 py-2 text-sm text-[#4A4A4A] hover:bg-[#F8F8F8]"
          >
            <InformationCircleIcon className="h-4 w-4" />
            Information
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log(`${student.name} performance clicked`);
              onClose();
            }}
            className="flex items-center gap-2 px-3 py-2 text-sm text-[#4A4A4A] hover:bg-[#F8F8F8]"
          >
            <ChartBarIcon className="h-4 w-4" />
            Performance
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log(`${student.name} remove clicked`);
              onClose();
            }}
            className="flex items-center gap-2 border-t border-[#EEEEEE] px-3 py-2 text-sm text-[#4A4A4A] hover:bg-[#F8F8F8]"
          >
            <TrashIcon className="h-4 w-4" />
            Remove
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log(`${student.name} email clicked`);
              onClose();
            }}
            className="flex items-center gap-2 border-t border-[#EEEEEE] px-3 py-2 text-sm text-[#4A4A4A] hover:bg-[#F8F8F8]"
          >
            <EnvelopeIcon className="h-4 w-4" />
            Email
          </button>
        </div>

        {/* Ellipsis */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(student.id);
          }}
          className={`
            flex h-8 w-8 items-center justify-center rounded-md transition-all duration-200
            text-[#7A7A7A] hover:bg-[#F1F1F1]
            opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100
            ${isOpen ? "opacity-100 scale-100 bg-[#F1F1F1]" : ""}
          `}
        >
          <EllipsisVerticalIcon
            className={`h-5 w-5 transition-transform duration-200 ${
              isOpen ? "rotate-90" : "group-hover:rotate-90"
            }`}
          />
        </button>
      </div>
    </div>
  );
}