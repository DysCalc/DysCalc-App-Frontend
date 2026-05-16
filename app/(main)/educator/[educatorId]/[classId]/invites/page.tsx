"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowPathIcon,
  ClipboardDocumentIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { createClassroomAPI } from "@/hooks/use-classroom";
import { createStudentAPI, type PendingInvite } from "@/hooks/use-students";
import { createEducatorsAPI } from "@/hooks/use-educators";
import { toast } from "sonner";
import {
  getClassroomVariant,
  headerStyles,
} from "@/constants/classroom-variants";
import type { Classroom, ClassroomWithStudentCount } from "@/types";
import DeleteInviteModal from "@/components/educator/DeleteInviteModal";

export default function ClassroomInvitesPage() {
  const params = useParams();
  const router = useRouter();

  const classId = params.classId as Classroom["id"];
  const educatorId = params.educatorId as Classroom["educator_id"];

  const [classroom, setClassroom] =
    useState<ClassroomWithStudentCount | null>(null);
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [educatorName, setEducatorName] = useState("Educator");
  const [isLoading, setIsLoading] = useState(true);
  const [rowLoadingEmail, setRowLoadingEmail] = useState<string | null>(null);
  const [deleteInvite, setDeleteInvite] = useState<PendingInvite | null>(null);

  const classroomAPI = useMemo(() => createClassroomAPI(), []);
  const educatorAPI = useMemo(() => createEducatorsAPI(), []);
  const studentAPI = useMemo(() => createStudentAPI(), []);

  const style = useMemo(
    () => headerStyles[getClassroomVariant(classId)],
    [classId]
  );

  useEffect(() => {
    let isMounted = true;

    const getData = async () => {
      setIsLoading(true);

      const [classroomResult, invitesResult, educatorResult] =
        await Promise.all([
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

  const handleConfirmDeleteInvite = async () => {
    if (!deleteInvite) return;

    setRowLoadingEmail(deleteInvite.email);

    const result = await studentAPI.removeInvite(
      deleteInvite.email,
      classId,
      educatorId
    );

    setRowLoadingEmail(null);

    if (!result.success) {
      toast.error(result.error || "Failed to remove invite");
      return;
    }

    setInvites((prev) =>
      prev.filter((entry) => entry.email !== deleteInvite.email)
    );

    setDeleteInvite(null);
    toast.success("Invite removed");
  };

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
    <>
      <div className="flex h-full w-full flex-col">
        <div
          className={`flex w-full flex-1 items-center border-b border-[#D9D9D9] pt-15 ${style.bg}`}
        >
          <div className="flex flex-1 flex-col items-start px-15">
            <div className={`text-5xl font-semibold ${style.title}`}>
              Pending Invites
            </div>

            <div className={`mt-2 text-lg font-light ${style.sub}`}>
              {classroom.name}
            </div>
          </div>

          <div className="px-15">
            <button
              type="button"
              onClick={() => router.push(`/educator/${educatorId}/${classId}`)}
              className="inline-flex h-11 items-center justify-center rounded-md border border-white/40 bg-white/90 px-6 text-base font-medium text-[#4A4A4A] shadow-sm transition duration-200 hover:bg-white"
            >
              Back to Classroom
            </button>
          </div>
        </div>

        <div className="flex w-full flex-1">
          <div className="w-full bg-white">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center border-b border-[#EDEDED] text-center text-sm font-semibold text-[#8A8A8A]">
              <div className="px-4 py-3">Email</div>
              <div className="border-l border-[#F2F2F2] px-4 py-3">
                Invited At
              </div>
              <div className="border-l border-[#F2F2F2] px-4 py-3">Status</div>
              <div className="border-l border-[#F2F2F2] px-4 py-3">
                Actions
              </div>
            </div>

            {invites.map((invite) => {
              const isBusy = rowLoadingEmail === invite.email;

              return (
                <div
                  key={invite.email}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center border-b border-[#F5F5F5] text-sm text-[#5C5E64] transition hover:bg-[#FAFAFA]"
                >
                  <div className="px-15 py-3 font-medium">{invite.email}</div>

                  <div className="border-l border-[#F5F5F5] px-4 py-3 text-center">
                    {new Date(invite.invited_at).toLocaleString()}
                  </div>

                  <div className="flex items-center justify-center border-l border-[#F5F5F5] px-4 py-3">
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#FFBB33] px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-white">
                      <span className="h-2 w-2 rounded-full bg-white" />
                      Pending
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-2 border-l border-[#F5F5F5] px-2 py-2">
                    {/* Copy */}
                    <button
                      type="button"
                      title="Copy invite link"
                      aria-label="Copy invite link"
                      onClick={() => {
                        navigator.clipboard.writeText(invite.inviteLink);
                        toast.success("Invite link copied");
                      }}
                      className="group relative inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E4E4E4] bg-[#F5F5F5] text-[#5C5E64] transition-all duration-300 hover:border-[#CFCFCF] hover:bg-[#EDEDED] hover:text-[#3F4147] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ClipboardDocumentIcon className="h-5 w-5" />

                      <span className="pointer-events-none absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#5C5E64] px-2.5 py-1 text-xs font-semibold text-white opacity-0 transition-all duration-200 group-hover:-top-10 group-hover:opacity-100">
                        Copy
                      </span>
                    </button>

                    {/* Resend */}
                    <button
                      type="button"
                      title={isBusy ? "Sending invite" : "Resend invite"}
                      aria-label={isBusy ? "Sending invite" : "Resend invite"}
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
                              ? {
                                  ...entry,
                                  invited_at: new Date().toISOString(),
                                  inviteLink: result.data,
                                }
                              : entry
                          )
                        );

                        toast.success("Invite resent");
                      }}
                      className="group relative inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#29A177] bg-[#29A177] text-white transition-all duration-300 hover:bg-[#238B66] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ArrowPathIcon
                        className={`h-5 w-5 ${isBusy ? "animate-spin" : ""}`}
                      />

                      <span className="pointer-events-none absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#29A177] px-2.5 py-1 text-xs font-semibold text-white opacity-0 transition-all duration-200 group-hover:-top-10 group-hover:opacity-100">
                        {isBusy ? "Sending" : "Resend"}
                      </span>
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      title="Delete invite"
                      aria-label="Delete invite"
                      disabled={isBusy}
                      onClick={() => setDeleteInvite(invite)}
                      className="group relative inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#EF4444] bg-[#EF4444] text-white transition-all duration-300 hover:bg-[#DC2626] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <TrashIcon className="h-5 w-5" />

                      <span className="pointer-events-none absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#EF4444] px-2.5 py-1 text-xs font-semibold text-white opacity-0 transition-all duration-200 group-hover:-top-10 group-hover:opacity-100">
                        Delete
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}

            {!invites.length && (
              <div className="py-12 text-center text-sm text-[#9A9A9A]">
                No pending invites for this classroom.
              </div>
            )}
          </div>
        </div>
      </div>

      {deleteInvite && (
        <DeleteInviteModal
          email={deleteInvite.email}
          isDeleting={rowLoadingEmail === deleteInvite.email}
          onCancel={() => setDeleteInvite(null)}
          onConfirm={handleConfirmDeleteInvite}
        />
      )}
    </>
  );
}