"use client";
import { useEffect, useState } from "react";
import { createStudentAPI } from "@/hooks/use-students";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import AlertModal from "@/components/shared/AlertModal";

import type { StudentProfile } from "@/types";
const studentAPI = createStudentAPI();

export default function Students() {
    const router = useRouter();
    const [students, setStudents] = useState<StudentProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    
    useEffect(() => {
        async function fetchStudents() {
            setLoading(true);
            const studentsResult = await studentAPI.fetchAllStudents();
            if (!studentsResult.success) toast.error(studentsResult.error || "Failed to load students");
            else setStudents(studentsResult.data);
            setLoading(false);
        }

        fetchStudents();
    }, []);

    async function handleDelete(id: string) {
        setIsDeleting(true);
        // Note: Delete functionality for student not fully implemented yet
        toast.error("Delete not supported for students yet.");
        setIsDeleting(false);
        setDeletingId(null);
    }

    const filtered = students.filter((s) => {
        const q = search.toLowerCase();
        return (
            (s.full_name || "").toLowerCase().includes(q) ||
            (s.email || "").toLowerCase().includes(q) ||
            (s.nickname || "").toLowerCase().includes(q)
        );
    });

    return (
        <div className="flex h-full w-full flex-col items-center bg-neutral-50">
            {/* Header */}
            <div className="flex w-full items-center justify-between border-b border-[#D9D9D9] px-15 py-10">
                <div>
                    <div className="text-5xl font-semibold text-neutral-600">
                        Students
                    </div>
                    <div className="text-lg font-light text-neutral-500">
                        Manage all registered students
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="w-full px-15 pt-6">
                <input
                    className="w-full rounded-lg border border-[#D9D9D9] px-4 py-3 text-base text-neutral-600 outline-none transition focus:border-[#29A177] focus:ring-2 focus:ring-[#29A177]/20"
                    placeholder="Search students..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="w-full p-15">
                <div className="overflow-hidden rounded-xl border border-[#E5E5E5] bg-white shadow-sm">
                    <table className="w-full">
                        {/* Head */}
                        <thead className="bg-neutral-50 border-b border-[#E5E5E5]">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                                    Name
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                                    Email
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                                    Nickname
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-neutral-500">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        {/* Body */}
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-10 text-center text-neutral-400">
                                        Loading...
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-10 text-center text-neutral-400">
                                        No students found.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((student) => (
                                    <tr
                                        key={student.id}
                                        className="border-b border-[#F0F0F0] hover:bg-neutral-50 transition"
                                    >
                                        {/* Name */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-md bg-[#E8F5EF] text-[#29A177] font-semibold flex items-center justify-center overflow-hidden">
                                                    {student.avatar_url ? (
                                                        <Image
                                                            src={student.avatar_url}
                                                            alt="User Avatar"
                                                            width={44}
                                                            height={44}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-[#29A177]">
                                                            {(student.full_name || "?").charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-sm font-medium text-neutral-700">
                                                    {student.full_name || "Unknown"}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Email */}
                                        <td className="px-6 py-4 text-sm text-neutral-500">
                                            {student.email || "—"}
                                        </td>

                                        {/* Nickname */}
                                        <td className="px-6 py-4 text-sm text-neutral-400">
                                            {student.nickname || "—"}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    className="rounded-md border border-[#D9D9D9] px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100"
                                                    onClick={() => router.push(`/student/${student.id}/dashboard`)}
                                                >
                                                    View
                                                </button>

                                                <button
                                                    className="rounded-md border border-[#D9D9D9] px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
                                                    disabled
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
                                                    disabled
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {deletingId && (
                <AlertModal
                    isOpen={!!deletingId}
                    onClose={() => setDeletingId(null)}
                    title="Delete Student"
                    description={`Are you sure you want to delete this student?`}
                    primaryAction={{
                        label: isDeleting ? "Deleting..." : "Confirm Delete",
                        onClick: async () => {
                            await handleDelete(deletingId)
                        },
                        variant: "danger",
                        disabled: isDeleting
                    }}
                    secondaryAction={{
                        label: "Cancel",
                        onClick: () => { setDeletingId(null) },
                        disabled: isDeleting
                    }}
                />
            )}
        </div >
    );
}
