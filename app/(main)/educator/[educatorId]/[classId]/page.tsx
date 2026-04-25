"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import StudentCard from "@/components/educator/StudentCard";
import { createClient } from "@/lib/supabase-client";
import { createClassroomAPI } from "@/hooks/use-classroom";
import { createStudentAPI } from "@/hooks/use-students";
import { useAuth } from "@/contexts/auth-provider";
import { toast } from "sonner";
import { headerStyles, getClassroomVariant } from "@/constants/classroom-variants";
import type { Classroom, ClassroomWithStudentCount } from "@/types";
import AlertModal from "@/components/shared/AlertModal";

type StudentCardModel = {
  id: string;
  name: string;
};

export default function ClassroomPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const classId = params.classId as Classroom['id'];
  const educatorId = params.educatorId as Classroom['educator_id'];

  const [classroom, setClassroom] = useState<ClassroomWithStudentCount | null>(null);
  const [students, setStudents] = useState<StudentCardModel[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"students" | "notifications">("students");
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
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
      setShowInviteModal(false);
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
          <button
            onClick={() => setShowInviteModal(true)}
            className="inline-flex h-11 items-center justify-center rounded-md bg-[#29A177] px-6 text-base font-medium text-white shadow-sm transition duration-200 hover:bg-[#018255] hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Invite Student
          </button>

          <button
            onClick={() => router.push(`/educator/${educatorId}/${classId}/invites`)}
            className="inline-flex h-11 items-center justify-center rounded-md border border-white/40 bg-white/90 px-6 text-base font-medium text-[#4A4A4A] shadow-sm transition duration-200 hover:bg-white"
          >
            Pending Invites
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
            onClick={() => {
              setActiveTab("notifications");
              router.push(`/educator/${educatorId}/${classId}/invites`);
            }}
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
          <div className="flex w-full items-center justify-center p-15">
            <button
              onClick={() => router.push(`/educator/${educatorId}/${classId}/invites`)}
              className="rounded-lg border border-[#D9D9D9] bg-white px-6 py-3 text-lg font-medium text-[#5C5E64] transition hover:bg-[#F8F8F8]"
            >
              Open Invite Management
            </button>
          </div>
        )}
      </div>

      <AlertModal
        isOpen={showInviteModal}
        onClose={() => {
          if (isInviting) return;
          setShowInviteModal(false);
        }}
        title="Invite Student"
        description="Send an email invite to add a student to this classroom."
        primaryAction={{
          label: isInviting ? "Sending..." : "Send Invite",
          onClick: () => {
            void handleInviteStudent();
          },
          disabled: isInviting || !inviteEmail.trim(),
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => setShowInviteModal(false),
          disabled: isInviting,
        }}
        maxWidth="md"
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="invite-email" className="text-sm font-medium text-[#6C6C6C]">
            Student Email
          </label>
          <input
            id="invite-email"
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
            className="rounded-lg border border-[#D9D9D9] px-4 py-3 text-base text-[#6C6C6C] outline-none transition focus:border-[#29A177] focus:ring-2 focus:ring-[#29A177]/20"
            autoFocus
            disabled={isInviting}
          />
        </div>
      </AlertModal>
    </div>
  );
}
