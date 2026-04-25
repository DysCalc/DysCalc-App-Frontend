"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import StudentCard from "@/components/educator/StudentCard";
import { createClient } from "@/lib/supabase-client";
import { createClassroomAPI } from "@/hooks/use-classroom";
import { createStudentAPI } from "@/hooks/use-students";
import { useAuth } from "@/contexts/auth-provider";
import { toast } from "sonner";
import { headerStyles, getClassroomVariant } from "../classroom/data";
import type { ClassroomWithStudentCount } from "@/types";

type StudentCardModel = {
  id: string;
  name: string;
};

export default function ClassroomPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const classId = params.classId as string;
  const educatorId = params.educatorId as string;

  const [classroom, setClassroom] = useState<ClassroomWithStudentCount | null>(null);
  const [students, setStudents] = useState<StudentCardModel[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"students" | "notifications">("students");
  const [isLoading, setIsLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  const supabase = useMemo(() => createClient(), []);
  const { getClassroomById } = useMemo(() => createClassroomAPI(supabase), [supabase]);
  const { inviteStudentByEmail } = useMemo(() => createStudentAPI(supabase), [supabase]);

  const classroomVariant = useMemo(() => getClassroomVariant(classId), [classId]);
  const styles = headerStyles[classroomVariant];

  useEffect(() => {
    let isMounted = true;

    const getData = async () => {
      setIsLoading(true);

      const [classroomResult, studentsResult] = await Promise.all([
        getClassroomById(classId),
        supabase.functions.invoke("classroom-students", {
          body: { classId },
        }),
      ]);

      if (!isMounted) return;

      if (!classroomResult.success) {
        toast.error("Failed to load classroom");
        setIsLoading(false);
        return;
      }

      if (studentsResult.error) {
        toast.error("Failed to load students");
        setIsLoading(false);
        return;
      }

      const studentsPayload = studentsResult.data as {
        success: boolean;
        data?: StudentCardModel[];
        error?: string;
      };

      if (!studentsPayload.success || !studentsPayload.data) {
        toast.error(studentsPayload.error || "Failed to load students");
        setIsLoading(false);
        return;
      }

      setClassroom(classroomResult.data);
      setStudents(studentsPayload.data);
      setIsLoading(false);
    };

    getData();

    return () => {
      isMounted = false;
    };
  }, [classId, getClassroomById, supabase]);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center text-lg font-medium text-[#6C6C6C]">
        Loading classroom...
      </div>
    );
  }

  if (!classroom) {
    return (
      <div className="flex h-full w-full items-center justify-center text-lg font-medium text-[#6C6C6C]">
        Classroom not found.
      </div>
    );
  }

  const handleInviteStudent = async () => {
    const email = inviteEmail.trim();

    if (!email) {
      toast.error("Please enter a student email");
      return;
    }

    setIsInviting(true);
    const res = await inviteStudentByEmail(
      email,
      classId,
      classroom.name,
      (user?.user_metadata?.full_name as string) || user?.email || "Educator"
    );
    setIsInviting(false);

    if (res.success) {
      setInviteEmail("");
      toast.success("Invite sent!", {
        description: `Link: ${res.data}`,
        action: {
          label: "Copy",
          onClick: () => navigator.clipboard.writeText(res.data),
        },
      });
      return;
    }

    toast.error(res.error || "Failed to invite student");
  };

  return (
    <div className="flex h-full w-full flex-col">
      <div
        className={`flex w-full flex-1 items-center border-b border-[#D9D9D9] pt-15 ${styles.bg}`}
      >
        <div className="flex flex-1 flex-col items-start px-15">
          <div className={`text-5xl font-semibold ${styles.title}`}>
            {classroom.name}
          </div>

          <div className={`mt-2 text-lg font-light ${styles.sub}`}>
            {classroom.student_count}{" "}
            {Number(classroom.student_count) === 1 ? "student" : "students"}
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end gap-3 px-15">
          <input
            type="email"
            value={inviteEmail}
            onChange={(event) => setInviteEmail(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void handleInviteStudent();
              }
            }}
            placeholder="student@email.com"
            className="h-11 w-full max-w-sm rounded-md border border-white/30 bg-white px-4 text-base text-[#4A4A4A] outline-none transition focus:border-[#29A177] focus:ring-2 focus:ring-[#29A177]/20"
          />

          <button
            onClick={() => void handleInviteStudent()}
            disabled={isInviting || !inviteEmail.trim()}
            className="inline-flex h-11 items-center justify-center rounded-md bg-[#29A177] px-6 text-base font-medium text-white shadow-sm transition duration-200 hover:bg-[#018255] hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isInviting ? "Inviting..." : "Invite Student"}
          </button>
        </div>
      </div>

      <div className="w-full border-b border-[#E5E5E5] bg-white px-15">
        <div className="flex items-center">
          <button
            onClick={() => setActiveTab("students")}
            className={`px-10 py-2 text-lg font-semibold transition ${
              activeTab === "students"
                ? "bg-[#F3F3F3] text-[#706F6F]"
                : "text-[#9A9A9A] hover:bg-[#F8F8F8] hover:text-[#706F6F]"
            }`}
          >
            Students
          </button>

          <button
            onClick={() => setActiveTab("notifications")}
            className={`px-10 py-2 text-lg font-semibold transition ${
              activeTab === "notifications"
                ? "bg-[#F3F3F3] text-[#706F6F]"
                : "text-[#9A9A9A] hover:bg-[#F8F8F8] hover:text-[#706F6F]"
            }`}
          >
            Notifications
          </button>
        </div>
      </div>

      <div className="flex flex-1 w-full">
        {activeTab === "students" ? (
          <div className="grid w-full grid-cols-3 grid-rows-4 gap-2 p-15 pb-55">
            {students.map((student) => {
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
                    router.push(
                      `/educator/${educatorId}/${classId}/student/${id}`
                    );
                  }}
                />
              );
            })}

            {!students.length && (
              <div className="col-span-3 rounded-lg border border-dashed border-[#D9D9D9] bg-white p-10 text-center text-[#7A7A7A]">
                No students found for this classroom yet.
              </div>
            )}
          </div>
        ) : (
          <div className="flex w-full items-center justify-center p-15 text-lg font-light text-[#7A7A7A]">
            Notifications are not available yet.
          </div>
        )}
      </div>
    </div>
  );
}
