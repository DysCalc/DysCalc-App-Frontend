"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { 
  MagnifyingGlassIcon, 
  ChevronUpDownIcon,
  FunnelIcon
} from "@heroicons/react/24/outline";
import { createEducatorAssessmentsAPI, type EducatorAssessmentRow } from "@/hooks/use-educator-assessments";
import { toast } from "sonner";
import { SparklesIcon } from "@heroicons/react/24/solid";

const assessmentsAPI = createEducatorAssessmentsAPI();

export default function EducatorAssessmentsHub() {
  const params = useParams();
  const router = useRouter();
  const educatorId = params.educatorId as string;

  const [assessments, setAssessments] = useState<EducatorAssessmentRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters and Sorting state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [classFilter, setClassFilter] = useState<string>("ALL");
  const [sortField, setSortField] = useState<"date" | "student">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    async function fetchAssessments() {
      setIsLoading(true);
      const res = await assessmentsAPI.getAllAssessments(educatorId);
      if (!res.success) {
        toast.error("Failed to load assessments: " + res.error);
      } else {
        setAssessments(res.data || []);
      }
      setIsLoading(false);
    }
    fetchAssessments();
  }, [educatorId]);

  const uniqueClassrooms = useMemo(() => {
    const classes = new Set(assessments.map(a => a.classroom_name));
    return Array.from(classes).sort();
  }, [assessments]);

  const filteredAndSortedAssessments = useMemo(() => {
    let result = [...assessments];

    // Search
    if (searchQuery.trim() !== "") {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(a => 
        a.student_name.toLowerCase().includes(lowerQuery) || 
        a.test_title.toLowerCase().includes(lowerQuery)
      );
    }

    // Class Filter
    if (classFilter !== "ALL") {
      result = result.filter(a => a.classroom_name === classFilter);
    }

    // Status Filter
    if (statusFilter !== "ALL") {
      if (statusFilter === "GENERATING") {
        result = result.filter(a => a.is_generating);
      } else if (statusFilter === "NEEDS_APPROVAL") {
        result = result.filter(a => !a.is_generating && !a.is_initial && !a.is_approved);
      } else if (statusFilter === "APPROVED") {
        result = result.filter(a => !a.is_generating && (!a.is_initial ? a.is_approved : true));
      }
    }

    // Sorting
    result.sort((a, b) => {
      if (sortField === "date") {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      } else {
        const nameA = a.student_name.toLowerCase();
        const nameB = b.student_name.toLowerCase();
        if (nameA < nameB) return sortOrder === "asc" ? -1 : 1;
        if (nameA > nameB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      }
    });

    return result;
  }, [assessments, searchQuery, statusFilter, classFilter, sortField, sortOrder]);

  const handleRowClick = (assessment: EducatorAssessmentRow) => {
    router.push(`/educator/${educatorId}/${assessment.classroom_id}/${assessment.student_id}?assessmentId=${assessment.id}`);
  };

  const toggleSort = (field: "date" | "student") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc"); // Default to desc for dates, asc for names normally but keeping it simple
      if (field === "student") setSortOrder("asc");
    }
  };

  return (
    <div className="flex h-full w-full flex-col bg-[#F7F7F7]">
      {/* Header */}
      <div className="shrink-0 border-b border-[#E7E7E7] bg-white px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#29A177]">
              Central Hub
            </p>
            <h1 className="mt-2 text-4xl font-extrabold leading-tight text-[#5C5E64]">
              All Assessments
            </h1>
            <p className="mt-2 text-zinc-500 max-w-2xl">
              View and manage all student screening and testing data across your classrooms.
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-[#ECF9F4] border border-[#29A177]/20 px-4 py-3 rounded-xl shadow-sm">
            <div className="flex flex-col text-right">
              <span className="text-xs font-semibold text-[#29A177] uppercase">Total Tests</span>
              <span className="text-2xl font-bold text-[#17815C]">{assessments.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 p-8 overflow-hidden">
        
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="relative w-full max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
            <input 
              type="text"
              placeholder="Search by student or test title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-zinc-200 bg-white text-sm text-zinc-700 shadow-sm focus:border-[#29A177] focus:ring-1 focus:ring-[#29A177] outline-none transition"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <FunnelIcon className="h-4 w-4 text-zinc-500" />
              <span className="text-sm font-medium text-zinc-600">Filters:</span>
            </div>

            <select 
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-zinc-200 bg-white text-sm font-medium text-zinc-700 outline-none hover:border-zinc-300 transition cursor-pointer shadow-sm"
            >
              <option value="ALL">All Classrooms</option>
              {uniqueClassrooms.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-zinc-200 bg-white text-sm font-medium text-zinc-700 outline-none hover:border-zinc-300 transition cursor-pointer shadow-sm"
            >
              <option value="ALL">All Statuses</option>
              <option value="APPROVED">Ready / Approved</option>
              <option value="NEEDS_APPROVAL">Needs Approval</option>
              <option value="GENERATING">Generating...</option>
            </select>
          </div>
        </div>

        {/* Table Container */}
        <div className="flex-1 bg-white border border-[#E7E7E7] rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="overflow-x-auto flex-1 relative">
            {isLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10">
                <div className="w-8 h-8 border-4 border-[#29A177] border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-sm font-semibold text-zinc-500">Loading Assessments...</p>
              </div>
            ) : filteredAndSortedAssessments.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                 <div className="bg-zinc-50 p-6 rounded-full mb-4">
                   <MagnifyingGlassIcon className="h-12 w-12 text-zinc-300" />
                 </div>
                 <h3 className="text-lg font-bold text-zinc-700">No assessments found</h3>
                 <p className="text-zinc-500 mt-2">Try adjusting your filters or search query.</p>
              </div>
            ) : null}

            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="sticky top-0 bg-zinc-50 border-b border-zinc-200 z-0">
                <tr>
                  <th 
                    className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500 cursor-pointer hover:bg-zinc-100 transition group"
                    onClick={() => toggleSort("student")}
                  >
                    <div className="flex items-center gap-1">
                      Student
                      <ChevronUpDownIcon className={`h-4 w-4 ${sortField === 'student' ? 'text-[#29A177]' : 'text-zinc-400 group-hover:text-zinc-600'}`} />
                    </div>
                  </th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Classroom
                  </th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Test Details
                  </th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Status
                  </th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Result
                  </th>
                  <th 
                    className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500 cursor-pointer hover:bg-zinc-100 transition group"
                    onClick={() => toggleSort("date")}
                  >
                    <div className="flex items-center gap-1">
                      Date Taken
                      <ChevronUpDownIcon className={`h-4 w-4 ${sortField === 'date' ? 'text-[#29A177]' : 'text-zinc-400 group-hover:text-zinc-600'}`} />
                    </div>
                  </th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500 text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredAndSortedAssessments.map((a) => {
                  
                  // Determine Status Badge
                  let statusBadge = null;
                  if (a.is_generating) {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 border border-blue-200">
                        <SparklesIcon className="h-3 w-3 animate-pulse" />
                        Generating
                      </span>
                    );
                  } else if (!a.is_initial && !a.is_approved) {
                    statusBadge = (
                      <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 border border-amber-200">
                        Needs Approval
                      </span>
                    );
                  } else {
                    statusBadge = (
                      <span className="inline-flex items-center rounded-full bg-[#ECF9F4] px-2.5 py-1 text-xs font-bold text-[#29A177] border border-[#29A177]/20">
                        Ready
                      </span>
                    );
                  }

                  // Determine Result Badge
                  let resultBadge = null;
                  if (!a.classification) {
                     resultBadge = <span className="text-zinc-400 text-sm font-medium italic">Pending</span>;
                  } else if (a.classification === "AT-RISK") {
                     resultBadge = (
                       <span className="inline-flex items-center rounded bg-red-50 px-2 py-1 text-xs font-bold text-red-700 border border-red-100">
                         At-Risk
                       </span>
                     );
                  } else {
                     resultBadge = (
                       <span className="inline-flex items-center rounded bg-zinc-100 px-2 py-1 text-xs font-bold text-zinc-700 border border-zinc-200">
                         Typical
                       </span>
                     );
                  }

                  // Determine Action Button
                  let actionButton = null;
                  if (a.is_generating) {
                    actionButton = (
                      <button disabled className="px-3 py-1 text-xs font-bold text-blue-400 bg-blue-50/50 rounded border border-transparent cursor-not-allowed">
                        Processing...
                      </button>
                    );
                  } else if (!a.is_initial && !a.is_approved) {
                    actionButton = (
                      <button className="px-3 py-1 text-xs font-bold text-white bg-amber-600 rounded hover:bg-amber-700 transition shadow-sm">
                        Review
                      </button>
                    );
                  } else {
                    actionButton = (
                      <button className="px-3 py-1 text-xs font-bold text-[#29A177] bg-[#ECF9F4] rounded border border-[#29A177]/20 hover:bg-[#D9F4EA] transition">
                        View
                      </button>
                    );
                  }

                  return (
                    <tr 
                      key={a.id} 
                      onClick={() => handleRowClick(a)}
                      className="hover:bg-[#F3FBF7] transition-colors cursor-pointer group"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-100 border border-zinc-200 group-hover:border-[#29A177]/50 transition-colors">
                            {a.student_avatar ? (
                              <Image
                                src={a.student_avatar}
                                alt={a.student_name}
                                width={40}
                                height={40}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-bold text-zinc-500">
                                {a.student_name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <span className="font-bold text-zinc-700 group-hover:text-[#29A177] transition-colors">
                            {a.student_name}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-medium text-zinc-600">{a.classroom_name}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-zinc-700">{a.test_title}</span>
                          <span className="text-xs text-zinc-500">{a.is_initial ? "Initial Diagnostic" : "Targeted Retest"}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {statusBadge}
                      </td>
                      <td className="p-4">
                        {resultBadge}
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-medium text-zinc-600">
                          {new Date(a.created_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {actionButton}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white border border-[#E7E7E7] rounded-xl shadow-sm p-4 flex flex-wrap items-center gap-x-8 gap-y-3 mt-4">
          <span className="text-sm font-bold text-zinc-700">Legend:</span>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700 border border-amber-200">Needs Approval</span>
            <span className="text-sm text-zinc-500">Awaiting your review before results are saved</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-[#ECF9F4] px-2 py-0.5 text-xs font-bold text-[#29A177] border border-[#29A177]/20">Ready</span>
            <span className="text-sm text-zinc-500">Results available</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded bg-red-50 px-2 py-0.5 text-xs font-bold text-red-700 border border-red-100">At-Risk</span>
            <span className="text-sm text-zinc-500">Student may need intervention</span>
          </div>
        </div>

      </div>
    </div>
  );
}
