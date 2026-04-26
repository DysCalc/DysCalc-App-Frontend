"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client"; // adjust to your supabase client path
import createEducatorsAPI from "@/hooks/use-educators";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";

type EducatorRow = {
    id: string;
    email: string;
    full_name: string;
    avatar_url?: string | null;
    nickname?: string | null;
    classroom_count: number;
};

const supabase = createClient();
const api = createEducatorsAPI(supabase);

export default function Educators() {
    const router = useRouter();
    const [educators, setEducators] = useState<EducatorRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [confirmId, setConfirmId] = useState<string | null>(null);

    useEffect(() => {
        fetchEducators();
    }, []);

    async function fetchEducators() {
        setLoading(true);
        setError(null);
        const educatorsResult = await api.fetchAllEducators();
        if (!educatorsResult.success) {
            toast.error(educatorsResult.error || "Failed to load educators");
        } else setEducators(educatorsResult.data);
        setLoading(false);
    }

    async function handleDelete(id: string) {
        setDeletingId(id);
        const educatorsResult = await api.deleteEducator(id);
        if (!educatorsResult.success) {
            toast.error(educatorsResult.error || "Failed to delete educator");
        }
        else setEducators((prev) => prev.filter((e) => e.id !== id));
        setDeletingId(null);
        setConfirmId(null);
    }

    const filtered = educators.filter((e) => {
        const q = search.toLowerCase();
        return (
            e.full_name.toLowerCase().includes(q) ||
            e.email.toLowerCase().includes(q) ||
            (e.nickname ?? "").toLowerCase().includes(q)
        );
    });

    const confirmEducator = educators.find((e) => e.id === confirmId);

    return (
        <div className="flex h-full w-full flex-col items-center bg-neutral-50">

            {/* Header */}
            <div className="flex w-full items-center justify-between border-b border-[#D9D9D9] px-15 py-10">
                <div>
                    <div className="text-5xl font-semibold text-neutral-600">
                        Educators
                    </div>
                    <div className="text-lg font-light text-neutral-500">
                        Manage all registered educators
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="w-full px-15 pt-6">
                <input
                    className="w-full rounded-lg border border-[#D9D9D9] px-4 py-3 text-base text-neutral-600 outline-none transition focus:border-[#29A177] focus:ring-2 focus:ring-[#29A177]/20"
                    placeholder="Search educators..."
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
                                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-neutral-500">
                                    Classrooms
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
                                    <td colSpan={5} className="px-6 py-10 text-center text-neutral-400">
                                        Loading...
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-neutral-400">
                                        No educators found.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((educator) => (
                                    <tr
                                        key={educator.id}
                                        className="border-b border-[#F0F0F0] hover:bg-neutral-50 transition"
                                    >
                                        {/* Name */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-md bg-[#E8F5EF] text-[#29A177] font-semibold flex items-center justify-center overflow-hidden">
                                                    {educator.avatar_url ? (
                                                        <Image
                                                            src={educator.avatar_url}
                                                            alt="User Avatar"
                                                            width={44}
                                                            height={44}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-[#29A177]">
                                                            {educator.full_name.charAt(0) || "?"}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-sm font-medium text-neutral-700">
                                                    {educator.full_name}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Email */}
                                        <td className="px-6 py-4 text-sm text-neutral-500">
                                            {educator.email}
                                        </td>

                                        {/* Nickname */}
                                        <td className="px-6 py-4 text-sm text-neutral-400">
                                            {educator.nickname || "—"}
                                        </td>

                                        {/* Classrooms */}
                                        <td className="px-6 py-4 text-center">
                                            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
                                                {educator.classroom_count}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    className="rounded-md border border-[#D9D9D9] px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100"
                                                    onClick={() => router.push(`/educator/${educator.id}/dashboard`)}
                                                >
                                                    View
                                                </button>

                                                <button
                                                    className="rounded-md border border-[#D9D9D9] px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100"
                                                // onClick={() => router.push(`/educators/${educator.id}/edit`)}
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-500 hover:bg-red-50"
                                                // onClick={() => setConfirmId(educator.id)}
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
        </div>
    );
}