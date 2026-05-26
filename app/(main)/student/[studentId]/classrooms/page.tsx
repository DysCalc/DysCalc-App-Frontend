"use client";

import { use, useEffect, useState } from "react";
import LearningPathCard from "@/components/student/LearningPathCard";
import { createStudentAPI } from "@/hooks/use-students";
import { toast } from "sonner";
import { ClassroomListItem } from "@/types";

const PATH_COLORS = [
  { accentColor: "#EF4444", textColor: "text-[#B5AA3D]" },
  { accentColor: "#29A177", textColor: "text-[#55AF55]" },
  { accentColor: "#ff9451", textColor: "text-[#55AF55]" },
];

function formatDuration(joinedAt: string) {
  const joinDate = new Date(joinedAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - joinDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 30) {
    return `${diffDays} days`;
  } else {
    const months = Math.floor(diffDays / 30);
    return `${diffDays} days (${months}months+)`;
  }
}

export default function StudentClassroomPage({ params } : { params: Promise<{studentId: string}> }) {
  const { studentId } = use(params);
  const [classrooms, setClassrooms] = useState<ClassroomListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchClassrooms = async () => {
      setIsLoading(true);
      const studentAPI = createStudentAPI();
      const result = await studentAPI.getClassrooms(studentId);

      if (!isMounted) return;

      if (result.success) {
        setClassrooms(result.data);
      } else {
        toast.error(result.error || "Failed to fetch classrooms");
      }
      setIsLoading(false);
    };

    fetchClassrooms();

    return () => {
      isMounted = false;
    };
  }, [studentId]);

  return (
    <main className="min-h-screen w-full bg-[#F7F7F7]">
      <section className="w-full bg-[radial-gradient(ellipse_120%_120%_at_20%_80%,_#FFF7C8_0%,_#FFE030_40%,_#F4CB00_100%)]">
        <div className="mx-auto flex min-h-[430px] max-w-7xl items-center justify-center px-8 py-10">
          <div className="grid w-full items-center gap-10">
            <div className="flex flex-col items-center text-center">
              <h1 className="max-w-md text-5xl font-extrabold leading-none text-white md:text-6xl">
                Let&apos;s go with your journey!
              </h1>

              <p className="mt-6 text-lg font-semibold text-[#59616B] md:text-xl">
                I am created to teach you learn numbers and math.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-8 py-10">
        {isLoading ? (
          <div className="flex w-full items-center justify-center py-20">
            <div className="text-lg font-medium text-[#6C6C6C]">Loading classrooms...</div>
          </div>
        ) : classrooms.length === 0 ? (
          <div className="flex w-full items-center justify-center py-20">
            <div className="text-lg font-medium text-[#6C6C6C]">You haven&apos;t joined any classrooms yet.</div>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-3">
            {classrooms.map((item, index) => {
              const colorConfig = PATH_COLORS[index % PATH_COLORS.length];
              return (
                <LearningPathCard
                  key={item.classroom_id}
                  studentId={studentId}
                  id={item.classroom_id}
                  title={item.classrooms?.name || "Classroom"}
                  duration={formatDuration(item.joined_at)}
                  code={item.classroom_id}
                  textColor={colorConfig.textColor}
                  accentColor={colorConfig.accentColor}
                />
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}