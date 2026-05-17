import Link from "next/link";
import { CalendarDays } from "lucide-react";

type Props = {
  studentId: string;
  classroomId: string;
  title: string;
  taskGivenDate: string;
  status?: string;
  moduleId: string;
};
function getStatusClass(status: string) {
  const normalizedStatus = status.trim().toLowerCase();

  if (normalizedStatus === "in progress") {
    return "border border-[#00e673] text-[#00A854] bg-[#00e673]/10 shadow-[0_0_12px_rgba(0,230,115,0.10)]";
  }

  if (normalizedStatus === "inactive") {
    return "border border-[#ff471a] text-[#ff471a] bg-[#ff471a]/10 shadow-[0_0_12px_rgba(245,158,11,0.10)]";
  }

  return "border border-[#D9D9D9] text-[#8A8A8A] bg-[#D9D9D9]/10 shadow-[0_0_12px_rgba(217,217,217,0.10)]";
}

export default function StudentsClassroomLearningPaths({
  studentId,
  classroomId,
  title,
  taskGivenDate,
  status,
  moduleId,
}: Props) {
  const displayStatus = status?.trim() || "Inactive";

  return (
    <Link
      href={`/student/${studentId}/classrooms/${classroomId}/${moduleId}`}
      className="flex w-full cursor-pointer items-center justify-between gap-5 border-b border-[#E5E5E5] bg-white px-15 py-5 text-inherit no-underline transition-colors duration-300 hover:bg-[#FAFAFA]"
    >
      {/* LEFT CONTENT */}
      <div className="flex min-w-0 flex-1 items-center justify-between gap-5">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="truncate text-2xl font-semibold text-[#9D9D9D]">
            {title}
          </h2>

          <div className="flex items-center gap-2 text-sm font-normal text-[#9A9A9A]">
            <CalendarDays size={16} />
            <span>Task given: {taskGivenDate}</span>
          </div>
        </div>

        {/* STATUS LABEL */}
        <div
          className={`flex min-w-[120px] items-center justify-center rounded-full px-5 py-1 text-sm font-semibold transition-colors duration-300 ${getStatusClass(
            displayStatus
          )}`}
        >
          {displayStatus}
        </div>
      </div>

      {/* START BUTTON */}
      <span
        className="ml-auto flex h-11 min-w-[140px] items-center justify-center rounded-md bg-[#29A177] px-16 text-lg font-bold text-white transition-colors duration-300 hover:bg-[#DFDC2F] hover:text-white"      >
        Start
      </span>
    </Link>
  );
}
