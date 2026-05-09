import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import StudentsClassroomLearningPaths from "@/components/student/StudentsClassroomLearningPaths";
import CopyClassroomCodeButton from "@/components/student/CopyClassroomCodeButton";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{
    studentId: string;
    classroomId: string;
  }>;
};

const classroomData = {
  primary: {
    title: "Primary Learning Path",
    description:
      "This learning plan is designed to introduce the fundamentals of mathematics.",
    code: "DSLDKNSA678B",
    accentColor: "#dfdc2f",
    softAccent: "#FEE2E2",
    learningPaths: [
      {
        title: "Primary Learning Path",
        taskGivenDate: "April 20, 2026",
        status: "In Progress",
        moduleId: "test-examination",
      },
      {
        title: "Number System",
        taskGivenDate: "April 21, 2026",
        status: "Inactive",
        moduleId: "number-system",
      },
    ],
  },

  secondary: {
    title: "Secondary Learning Path",
    description:
      "This learning plan is designed to strengthen mathematical reasoning and problem-solving skills.",
    code: "DSLDKNSZ924S",
    accentColor: "#29A177",
    softAccent: "#DFF5EC",
    learningPaths: [
      {
        title: "Secondary Learning Path",
        taskGivenDate: "April 22, 2026",
        status: "Inactive",
        moduleId: "test-examination",
      },
    ],
  },
};

export default async function ClassroomLearningPathPage({ params }: Props) {
  const { studentId, classroomId } = await params;

  const classroom = classroomData[classroomId as keyof typeof classroomData];

  if (!classroom) {
    notFound();
  }

  return (
    <main className="min-h-screen w-full bg-[#F7F7F7]">
      <section className="flex min-h-screen w-full flex-col">
        {/* Back */}
        <Link
          href={`/student/${studentId}/classrooms`}
          className="mb-6 mt-10 inline-flex items-center gap-2 px-6 text-sm font-semibold text-[#9A9A9A] transition hover:text-[#555]"
        >
          <ArrowLeft size={18} />
          Back to Classrooms
        </Link>

        {/* Header Card */}
        <section className="flex w-full flex-1 items-center px-6">
          <div className="flex w-full flex-1 flex-col gap-4 px-10 py-12">
            <h1 className="text-5xl font-bold text-[#9D9D9D]">
              {classroom.title}
            </h1>

            <p className="max-w-3xl text-lg text-[#666]">
              {classroom.description}
            </p>

            <div className="mt-8 flex items-center gap-2">
              <p className="text-base font-medium tracking-wide text-[#BDBDBD]">
                {classroom.code}
              </p>

              <CopyClassroomCodeButton code={classroom.code} />
            </div>
          </div>
        </section>

        {/* Module List */}
        <div className="mt-2 flex w-full flex-1 flex-col gap-0 bg-white">
          {classroom.learningPaths.map((path) => (
            <StudentsClassroomLearningPaths
              key={path.moduleId}
              studentId={studentId}
              classroomId={classroomId}
              title={path.title}
              taskGivenDate={path.taskGivenDate}
              status={path.status}
              moduleId={path.moduleId}
            />
          ))}
        </div>
      </section>
    </main>
  );
}