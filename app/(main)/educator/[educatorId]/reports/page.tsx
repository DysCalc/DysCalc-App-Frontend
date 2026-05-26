"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { 
  ArrowDownTrayIcon,
  FunnelIcon,
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon
} from "@heroicons/react/24/outline";
import { createEducatorReportsAPI, type EducatorReportRow, scoreFromJson } from "@/hooks/use-educator-reports";
import { toast } from "sonner";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const reportsAPI = createEducatorReportsAPI();

const COLORS = {
  primary: '#29A177',
  secondary: '#5C5E64',
  danger: '#EF4444',
  warning: '#F59E0B',
  typical: '#3B82F6',
  atRisk: '#EF4444',
  unclassified: '#9CA3AF'
};

const TEST_FIELDS = [
  { key: "dot_matching", label: "Dot Matching" },
  { key: "number_comparison", label: "Number Comparison" },
  { key: "number_series", label: "Number Series" },
  { key: "single_addition", label: "Single Addition" },
  { key: "single_subtraction", label: "Single Subtraction" },
  { key: "complex_arithmetic", label: "Complex Arithmetic" },
];

export default function EducatorReportsDashboard() {
  const params = useParams();
  const router = useRouter();
  const educatorId = params.educatorId as string;
  const reportRef = useRef<HTMLDivElement>(null);

  const [assessments, setAssessments] = useState<EducatorReportRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Filters
  const [classFilter, setClassFilter] = useState<string>("ALL");

  useEffect(() => {
    async function fetchReports() {
      setIsLoading(true);
      const res = await reportsAPI.getReportsData(educatorId);
      if (!res.success) {
        toast.error("Failed to load reports: " + res.error);
      } else {
        setAssessments(res.data || []);
      }
      setIsLoading(false);
    }
    fetchReports();
  }, [educatorId]);

  const uniqueClassrooms = useMemo(() => {
    const classes = new Set(assessments.map(a => a.classroom_name));
    return Array.from(classes).sort();
  }, [assessments]);

  const filteredAssessments = useMemo(() => {
    let result = [...assessments];
    if (classFilter !== "ALL") {
      result = result.filter(a => a.classroom_name === classFilter);
    }
    return result;
  }, [assessments, classFilter]);

  const finishedAssessments = useMemo(() => {
    return filteredAssessments.filter(a => a.classification !== null && !a.is_generating);
  }, [filteredAssessments]);

  const unfinishedAssessments = useMemo(() => {
    return filteredAssessments.filter(a => a.classification === null || a.is_generating);
  }, [filteredAssessments]);

  // Derived Metrics
  const metrics = useMemo(() => {
    const uniqueStudents = new Set(finishedAssessments.map(a => a.student_id)).size;
    const totalTests = finishedAssessments.length;
    
    const classifiedTests = finishedAssessments.filter(a => a.classification !== null);
    const atRiskTests = classifiedTests.filter(a => a.classification === 'AT-RISK').length;
    const atRiskPercentage = classifiedTests.length > 0 ? Math.round((atRiskTests / classifiedTests.length) * 100) : 0;

    return { uniqueStudents, totalTests, atRiskPercentage, atRiskTests, typicalTests: classifiedTests.length - atRiskTests };
  }, [finishedAssessments]);

  // Pie Chart Data
  const riskDistributionData = useMemo(() => {
    return [
      { name: 'Typical', value: metrics.typicalTests, color: COLORS.typical },
      { name: 'At-Risk', value: metrics.atRiskTests, color: COLORS.atRisk },
      { name: 'Unclassified', value: finishedAssessments.length - metrics.typicalTests - metrics.atRiskTests, color: COLORS.unclassified }
    ].filter(d => d.value > 0);
  }, [metrics, finishedAssessments]);

  // Bar Chart Data (Skill Gaps)
  const skillGapsData = useMemo(() => {
    const data = TEST_FIELDS.map(field => {
      let totalScore = 0;
      let count = 0;
      finishedAssessments.forEach(assessment => {
        const score = scoreFromJson(assessment.scores[field.key as keyof typeof assessment.scores]);
        if (score !== null) {
          totalScore += score;
          count++;
        }
      });
      return {
        subject: field.label,
        average: count > 0 ? Math.round(totalScore / count) : 0,
        fullMark: 100
      };
    });
    return data;
  }, [finishedAssessments]);

  // Interventions List (Students with targeted retests)
  const interventionsList = useMemo(() => {
    const retests = finishedAssessments.filter(a => !a.is_initial);
    // Map to student and see if they improved
    const improvements = retests.map(retest => {
      const initials = finishedAssessments.filter(a => a.is_initial && a.student_id === retest.student_id);
      const initial = initials.length > 0 ? initials[initials.length - 1] : null;
      
      return {
        id: retest.id,
        student_id: retest.student_id,
        student_name: retest.student_name,
        student_avatar: retest.student_avatar,
        classroom_id: retest.classroom_id,
        test_title: retest.test_title,
        status: retest.classification,
        hasInitial: !!initial,
        date: new Date(retest.created_at).toLocaleDateString()
      };
    });
    return improvements.slice(0, 10); // Show latest 10
  }, [finishedAssessments]);

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    toast.info("Generating PDF, please wait...");
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Classroom_Report_${classFilter}_${new Date().toLocaleDateString()}.pdf`);
      toast.success("PDF Report Exported!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to export PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#F7F7F7]">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-[#29A177] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-sm font-semibold text-zinc-500">Compiling analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col bg-[#F7F7F7] overflow-y-auto" ref={reportRef}>
      {/* Header */}
      <div className="shrink-0 border-b border-[#E7E7E7] bg-white px-8 py-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#29A177]">
            Analytics & Reports
          </p>
          <h1 className="mt-2 text-4xl font-extrabold leading-tight text-[#5C5E64]">
            Dyscalculia Insights
          </h1>
          <p className="mt-2 text-zinc-500 max-w-2xl">
            Analyze classroom performance, identify skill gaps, and track intervention progress.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 px-4 py-2.5 rounded-lg shadow-sm">
            <FunnelIcon className="h-5 w-5 text-zinc-500" />
            <select 
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="bg-transparent text-sm font-bold text-zinc-700 outline-none cursor-pointer"
            >
              <option value="ALL">All Classrooms</option>
              {uniqueClassrooms.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <button 
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-2 bg-[#29A177] text-white px-5 py-2.5 rounded-lg font-bold shadow-sm hover:bg-[#208260] transition disabled:opacity-50"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
            {isExporting ? "Exporting..." : "Export PDF"}
          </button>
        </div>
      </div>

      <div className="flex-1 p-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E7E7E7] flex items-center gap-4">
            <div className="p-4 bg-[#ECF9F4] rounded-xl text-[#29A177]">
              <UserGroupIcon className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-500 uppercase">Total Students</p>
              <p className="text-3xl font-extrabold text-zinc-800">{metrics.uniqueStudents}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E7E7E7] flex items-center gap-4">
            <div className="p-4 bg-blue-50 rounded-xl text-blue-600">
              <ClipboardDocumentCheckIcon className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-500 uppercase">Assessments Taken</p>
              <p className="text-3xl font-extrabold text-zinc-800">{metrics.totalTests}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E7E7E7] flex items-center gap-4">
            <div className={`p-4 rounded-xl ${metrics.atRiskPercentage > 30 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
              <ExclamationTriangleIcon className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-500 uppercase">At-Risk Rate</p>
              <p className="text-3xl font-extrabold text-zinc-800">{metrics.atRiskPercentage}%</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Risk Distribution Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E7E7E7] lg:col-span-1">
            <h3 className="text-lg font-bold text-zinc-700 mb-6">Risk Distribution</h3>
            <div className="h-64">
              {riskDistributionData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {riskDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontWeight: 'bold' }}
                    />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-zinc-400">No data available</div>
              )}
            </div>
          </div>

          {/* Skill Gaps Bar Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E7E7E7] lg:col-span-2 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-zinc-700">Global Skill Gaps</h3>
              <span className="text-xs font-semibold bg-blue-50 text-blue-600 px-3 py-1 rounded-full">Class Average %</span>
            </div>
            <div className="flex-1 min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillGapsData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="subject" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip 
                    cursor={{ fill: '#F3F4F6' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => [`${value}%`, 'Average Score']}
                  />
                  <Bar dataKey="average" fill="#29A177" radius={[4, 4, 0, 0]} barSize={40}>
                    {skillGapsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.average < 50 ? '#EF4444' : entry.average < 75 ? '#F59E0B' : '#29A177'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-center text-zinc-500 mt-2 font-medium">
              *Bars in red (&lt;50%) or yellow (&lt;75%) indicate recommended areas for intervention.
            </p>
          </div>
        </div>

        {/* Interventions */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E7E7E7]">
          <h3 className="text-lg font-bold text-zinc-700 mb-6 flex items-center gap-2">
            <ArrowTrendingUpIcon className="h-5 w-5 text-[#29A177]" />
            Recent Interventions (Targeted Retests)
          </h3>
          
          <div className="overflow-x-auto">
            {interventionsList.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200">
                    <th className="p-3 text-xs font-bold uppercase tracking-wider text-zinc-500">Student</th>
                    <th className="p-3 text-xs font-bold uppercase tracking-wider text-zinc-500">Retest Title</th>
                    <th className="p-3 text-xs font-bold uppercase tracking-wider text-zinc-500">Date</th>
                    <th className="p-3 text-xs font-bold uppercase tracking-wider text-zinc-500 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {interventionsList.map(retest => (
                    <tr key={retest.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-100">
                            {retest.student_avatar ? (
                              <Image src={retest.student_avatar} alt={retest.student_name} width={32} height={32} className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-xs font-bold text-zinc-500">{retest.student_name.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <span className="font-bold text-zinc-700">{retest.student_name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-sm font-medium text-zinc-600">{retest.test_title}</td>
                      <td className="p-3 text-sm text-zinc-500">{retest.date}</td>
                      <td className="p-3 text-right">
                        <button 
                          onClick={() => router.push(`/educator/${educatorId}/${retest.classroom_id}/${retest.student_id}`)}
                          className="text-sm font-bold text-[#29A177] hover:text-[#17815C] transition-colors"
                        >
                          View Progress
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center p-6 bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
                <p className="text-zinc-500 font-medium">No retests have been completed yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Unfinished Assessments Island */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E7E7E7] mt-8">
          <h3 className="text-lg font-bold text-zinc-700 mb-6 flex items-center gap-2">
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
              <ExclamationTriangleIcon className="h-5 w-5" />
            </div>
            Unfinished Assessments ({unfinishedAssessments.length})
          </h3>
          
          <div className="overflow-x-auto">
            {unfinishedAssessments.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200">
                    <th className="p-3 text-xs font-bold uppercase tracking-wider text-zinc-500">Student</th>
                    <th className="p-3 text-xs font-bold uppercase tracking-wider text-zinc-500">Test Title</th>
                    <th className="p-3 text-xs font-bold uppercase tracking-wider text-zinc-500">Status</th>
                    <th className="p-3 text-xs font-bold uppercase tracking-wider text-zinc-500 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {unfinishedAssessments.map(assessment => (
                    <tr key={assessment.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-100">
                            {assessment.student_avatar ? (
                              <Image src={assessment.student_avatar} alt={assessment.student_name} width={32} height={32} className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-xs font-bold text-zinc-500">{assessment.student_name.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <span className="font-bold text-zinc-700">{assessment.student_name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-sm font-medium text-zinc-600">{assessment.test_title}</td>
                      <td className="p-3 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${assessment.is_generating ? 'bg-blue-50 text-blue-600' : (!assessment.is_initial && !assessment.is_given) ? 'bg-zinc-100 text-zinc-600' : 'bg-amber-50 text-amber-600'}`}>
                          {assessment.is_generating ? "Generating..." : (!assessment.is_initial && !assessment.is_given) ? "Needs Approval" : "Needs Attention"}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button 
                          onClick={() => router.push(`/educator/${educatorId}/${assessment.classroom_id}/${assessment.student_id}`)}
                          className="text-sm font-bold text-[#29A177] hover:text-[#17815C] transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center p-6 bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
                <p className="text-zinc-500 font-medium">No unfinished assessments.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
