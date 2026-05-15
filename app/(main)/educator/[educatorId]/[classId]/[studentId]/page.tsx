"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  EllipsisVerticalIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { createClassroomAPI } from "@/hooks/use-classroom";
import { createStudentAPI } from "@/hooks/use-students";
import type { Json } from "@/database.types";
import { toast } from "sonner";
import ScreeningInformation from "./tabs/ScreeningInformation";
import LearningPath from "./tabs/LearningPath";
import Performance from "./tabs/Performance";
import { getClassroomVariant } from "@/constants/classroom-variants";
import type { Classroom, Student, ClassroomWithStudentCount, StudentClassroomProfile, Classification } from "@/types";

type ScoreRow = {
  key: string;
  label: string;
  score: number | null;
};

type ScreeningDetails = {
  classification: Classification | null;
  created_at: string | null;
  scores: ScoreRow[];
  averageScore: number | null;
};

type ClassroomVariant = Pick<ClassroomWithStudentCount, "id" | "name" | "student_count"> & {
  variant: "yellow" | "green" | "blue" | "gray";
}
type StudentSummary = Pick<StudentClassroomProfile, "id" | "name">

const TEST_FIELDS: Array<{ key: string; label: string }> = [
  { key: "dot_matching", label: "Dot Matching" },
  { key: "number_comparison", label: "Number Comparison" },
  { key: "number_series", label: "Number Series" },
  { key: "single_addition", label: "Single Addition" },
  { key: "single_subtraction", label: "Single Subtraction" },
  { key: "complex_arithmetic", label: "Complex Arithmetic" },
];

function normalizePercent(value: number): number | null {
  if (!Number.isFinite(value)) return null;
  if (value < 0) return null;
  if (value <= 1) return Number((value * 100).toFixed(1));
  if (value <= 100) return Number(value.toFixed(1));
  return null;
}

function scoreFromJson(value: Json): number | null {
  if (typeof value === "number") {
    return normalizePercent(value);
  }

  if (Array.isArray(value)) {
    const scores = value
      .map((item) => scoreFromJson(item))
      .filter((item): item is number => item !== null);

    if (!scores.length) return null;
    const average = scores.reduce((sum, current) => sum + current, 0) / scores.length;
    return Number(average.toFixed(1));
  }

  if (value && typeof value === "object") {
    const item = value as Record<string, Json | undefined>;
    const directKeys = ["score", "percentage", "percent", "accuracy", "value", "result"];

    for (const key of directKeys) {
      const candidate = item[key];
      if (typeof candidate === "number") {
        const normalized = normalizePercent(candidate);
        if (normalized !== null) return normalized;
      }
    }

    if (typeof item.correct === "number" && typeof item.total === "number" && item.total > 0) {
      return Number(((item.correct / item.total) * 100).toFixed(1));
    }

    const nested = Object.values(item)
      .map((nestedValue) => (nestedValue === undefined ? null : scoreFromJson(nestedValue)))
      .filter((nestedValue): nestedValue is number => nestedValue !== null);

    if (!nested.length) return null;
    const average = nested.reduce((sum, current) => sum + current, 0) / nested.length;
    return Number(average.toFixed(1));
  }

  return null;
}

const classroomAPI = createClassroomAPI();
const studentAPI = createStudentAPI();

export default function StudentDetailPage() {
  const params = useParams();

  const classId = params.classId as Classroom['id'];
  const studentId = params.studentId as Student['id'];

  const [activeTab, setActiveTab] = useState<"screening" | "learning" | "performance">("screening");
  const [isLoading, setIsLoading] = useState(true);
  const [student, setStudent] = useState<StudentSummary | null>(null);
  const [classroom, setClassroom] = useState<ClassroomVariant | null>(null);
  const [screening, setScreening] = useState<ScreeningDetails | null>(null);

  useEffect(() => {
    let isMounted = true;

    const getData = async () => {
      setIsLoading(true);

      const [classroomResult, studentResult, testResult] = await Promise.all([
        classroomAPI.getClassroomById(classId),
        studentAPI.getClassroomStudent(classId, studentId),
        studentAPI.getLatestInitialTestResult(classId, studentId),
      ]);

      if (!isMounted) return;

      if (!classroomResult.success || !studentResult.success || !testResult.success) {
        toast.error("Failed to load student details");
        setIsLoading(false);
        return;
      }

      const classification: Classification | null = testResult.data?.classification ?? null;

      const scores: ScoreRow[] = testResult.data
        ? TEST_FIELDS.map((field) => ({
          key: field.key,
          label: field.label,
          score: scoreFromJson((testResult.data as Record<string, Json>)[field.key]),
        }))
        : [];

      const availableScores = scores
        .map((score) => score.score)
        .filter((score): score is number => score !== null);

      const averageScore = availableScores.length
        ? Number(
          (
            availableScores.reduce((sum, current) => sum + current, 0) /
            availableScores.length
          ).toFixed(1)
        )
        : null;

      setClassroom({
        id: classroomResult.data.id,
        name: classroomResult.data.name,
        student_count: classroomResult.data.student_count,
        variant: getClassroomVariant(classroomResult.data.id),
      });

      setStudent({
        id: studentResult.data.id,
        name: studentResult.data.name,
      });

      setScreening({
        classification,
        created_at: testResult.data?.created_at ?? null,
        scores,
        averageScore,
      });

      setIsLoading(false);
    };

    getData();

    return () => {
      isMounted = false;
    };
  }, [classId, studentId]);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center text-lg font-medium text-[#6C6C6C]">
        Loading student details...
      </div>
    );
  }

  if (!classroom || !student || !screening) {
    return (
      <div className="flex h-full w-full items-center justify-center text-lg font-medium text-[#6C6C6C]">
        Student or classroom not found.
      </div>
    );
  }

  return (
    <div className="flex h-full w-full min-h-0 flex-col bg-neutral-50">

      <div className="flex min-h-0 w-full h-24 border-b border-[#E5E5E5] bg-white px-8">
        <div className="flex w-full items-center justify-between">
          <div className="flex h-full items-center">
            <button
              onClick={() => setActiveTab("screening")}
              className={`h-full px-20 text-lg font-semibold transition ${activeTab === "screening"
                ? "bg-[#F3F3F3] text-[#706F6F]"
                : "text-[#9A9A9A] hover:bg-[#F8F8F8] hover:text-[#706F6F]"
                }`}
            >
              Screening Information
            </button>

            <button
              onClick={() => setActiveTab("learning")}
              className={`h-full px-20 text-lg font-semibold transition ${activeTab === "learning"
                ? "bg-[#F3F3F3] text-[#706F6F]"
                : "text-[#9A9A9A] hover:bg-[#F8F8F8] hover:text-[#706F6F]"
                }`}
            >
              Learning Path
            </button>

            <button
              onClick={() => setActiveTab("performance")}
              className={`h-full px-20 text-lg font-semibold transition ${activeTab === "performance"
                ? "bg-[#F3F3F3] text-[#706F6F]"
                : "text-[#9A9A9A] hover:bg-[#F8F8F8] hover:text-[#706F6F]"
                }`}
            >
              Performance
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex h-10 w-10 items-center justify-center rounded-md text-[#7A7A7A] transition hover:bg-[#F1F1F1]">
              <EnvelopeIcon className="h-5 w-5" />
            </button>

            <button className="flex h-10 w-10 items-center justify-center rounded-md text-[#7A7A7A] transition hover:bg-[#F1F1F1]">
              <EllipsisVerticalIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 w-full flex-[65] overflow-hidden">
        {activeTab === "screening" && (
          <ScreeningInformation
            student={student}
            classroom={classroom}
            classId={classId}
            studentId={student.id}
            screening={screening}
            onGenerateLearningPath={() => setActiveTab("learning")}
          />
        )}

        {activeTab === "learning" && (
          <LearningPath
            student={student}
            classroom={classroom}
            classId={classId}
            studentId={student.id}
            screening={screening}
          />
        )}

        {activeTab === "performance" && (
          <Performance
            student={student}
            classroom={classroom}
            classId={classId}
            studentId={student.id}
            screening={screening}
          />
        )}
      </div>
    </div>
  );
}
