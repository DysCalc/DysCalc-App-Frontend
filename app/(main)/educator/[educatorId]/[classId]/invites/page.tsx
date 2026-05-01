"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClassroomAPI } from "@/hooks/use-classroom";
import { createStudentAPI, type PendingInvite } from "@/hooks/use-students";
import { createEducatorsAPI } from "@/hooks/use-educators";
import { toast } from "sonner";
import { getClassroomVariant, headerStyles } from "@/constants/classroom-variants";
import type { Classroom, ClassroomWithStudentCount } from "@/types";

export default function ClassroomInvitesPage() {
  const params = useParams();
  const router = useRouter();

  const classId = params.classId as Classroom['id'];
  const educatorId = params.educatorId as Classroom['educator_id'];

  const [classroom, setClassroom] = useState<ClassroomWithStudentCount | null>(null);
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [educatorName, setEducatorName] = useState("Educator");
  const [isLoading, setIsLoading] = useState(true);
  const [rowLoadingEmail, setRowLoadingEmail] = useState<string | null>(null);

  const classroomAPI = useMemo(() => createClassroomAPI(), []);
  const educatorAPI = useMemo(() => createEducatorsAPI(), []);
  const studentAPI = useMemo(() => createStudentAPI(), []);

  const style = useMemo(() => headerStyles[getClassroomVariant(classId)], [classId]);

  useEffect(() => {
    let isMounted = true;

    const getData = async () => {
      setIsLoading(true);
      const [classroomResult, invitesResult, educatorResult] = await Promise.all([
        classroomAPI.getClassroomById(classId),
        studentAPI.getPendingInvites(classId, educatorId),
        educatorAPI.fetchEducatorById(educatorId),
      ]);

      if (!isMounted) return;

      if (!classroomResult.success) {
        toast.error("Failed to load classroom");
        setIsLoading(false);
        return;
      }

      if (!invitesResult.success) {
        toast.error(invitesResult.error || "Failed to fetch pending invites");
        setIsLoading(false);
        return;
      }

      setClassroom(classroomResult.data);
      setInvites(invitesResult.data);

      if (educatorResult.success && educatorResult.data?.full_name) {
        setEducatorName(educatorResult.data.full_name);
      }

      setIsLoading(false);
    };

    getData();

    return () => {
      isMounted = false;
    };
  }, [classId, educatorId, classroomAPI, educatorAPI, studentAPI]);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center text-lg font-medium text-[#6C6C6C]">
        Loading invites...
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

  return (
    <div className="flex h-full w-full flex-col">
      <div className={`flex w-full flex-1 items-center border-b border-[#D9D9D9] pt-15 ${style.bg}`}>
        <div className="flex flex-1 flex-col items-start px-15">
          <div className={`text-5xl font-semibold ${style.title}`}>Pending Invites</div>
          <div className={`mt-2 text-lg font-light ${style.sub}`}>{classroom.name}</div>
        </div>

        <div className="px-15">
          <button
            onClick={() => router.push(`/educator/${educatorId}/${classId}`)}
            className="inline-flex h-11 items-center justify-center rounded-md border border-white/40 bg-white/90 px-6 text-base font-medium text-[#4A4A4A] shadow-sm transition duration-200 hover:bg-white"
          >
            Back to Classroom
          </button>
        </div>
      </div>

      <div className="flex flex-1 w-full p-15">
        <div className="w-full rounded-xl border border-[#D9D9D9] bg-white shadow-sm">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center border-b border-[#EDEDED] px-6 py-4 text-sm font-semibold text-[#7A7A7A]">
            <div>Email</div>
            <div>Invited At</div>
            <div>Status</div>
            <div className="text-right">Actions</div>
          </div>

          {invites.map((invite) => {
            const isBusy = rowLoadingEmail === invite.email;
            return (
              <div
                key={invite.email}
                className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center border-b border-[#F2F2F2] px-6 py-4 text-sm text-[#5C5E64]"
              >
                <div>{invite.email}</div>
                <div>{new Date(invite.invited_at).toLocaleString()}</div>
                <div>
                  <span className="rounded-full bg-[#FFF6E6] px-3 py-1 text-xs font-medium text-[#AF7A00]">
                    Pending
                  </span>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(invite.inviteLink);
                      toast.success("Invite link copied");
                    }}
                    className="rounded-md border border-[#D9D9D9] px-3 py-1.5 text-xs font-medium text-[#5C5E64] transition hover:bg-[#F8F8F8]"
                  >
                    Copy Link
                  </button>

                  <button
                    disabled={isBusy}
                    onClick={async () => {
                      setRowLoadingEmail(invite.email);
                      const result = await studentAPI.resendInvite(
                        invite.email,
                        classId,
                        classroom.name,
                        educatorName,
                        educatorId
                      );
                      setRowLoadingEmail(null);

                      if (!result.success) {
                        toast.error(result.error || "Failed to resend invite");
                        return;
                      }

                      setInvites((prev) =>
                        prev.map((entry) =>
                          entry.email === invite.email
                            ? { ...entry, invited_at: new Date().toISOString(), inviteLink: result.data }
                            : entry
                        )
                      );
                      toast.success("Invite resent");
                    }}
                    className="rounded-md bg-[#29A177] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#018255] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isBusy ? "Sending..." : "Resend"}
                  </button>

                  <button
                    disabled={isBusy}
                    onClick={async () => {
                      setRowLoadingEmail(invite.email);
                      const result = await studentAPI.removeInvite(invite.email, classId, educatorId);
                      setRowLoadingEmail(null);

                      if (!result.success) {
                        toast.error(result.error || "Failed to remove invite");
                        return;
                      }

                      setInvites((prev) => prev.filter((entry) => entry.email !== invite.email));
                      toast.success("Invite removed");
                    }}
                    className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}

          {!invites.length && (
            <div className="p-10 text-center text-[#7A7A7A]">No pending invites for this classroom.</div>
          )}
        </div>
      </div>
    </div>
  );
}
