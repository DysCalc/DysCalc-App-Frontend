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
    analytics: {
      averageScore: 75,
      averageReactionTime: 6.2,
      pointColors: ["#F7E967", "#E5DD45", "#D6CE2F", "#BFB726", "#A8A020"],
      points: [
        { reactionTime: 3.2, score: 90 },
        { reactionTime: 4.5, score: 85 },
        { reactionTime: 6.1, score: 75 },
        { reactionTime: 8.3, score: 62 },
        { reactionTime: 10.4, score: 48 },
      ],
    },
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
    analytics: {
      averageScore: 68,
      averageReactionTime: 7.4,
      pointColors: ["#A7F3D0", "#6EE7B7", "#34D399", "#29A177", "#1F7658"],
      points: [
        { reactionTime: 4.1, score: 78 },
        { reactionTime: 5.8, score: 72 },
        { reactionTime: 7.0, score: 68 },
        { reactionTime: 8.9, score: 58 },
        { reactionTime: 11.2, score: 45 },
      ],
    },
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

        {/* Header + Analytics */}
        <section className="flex w-full flex-1 items-center border-b border-[#E5E5E5] px-6">
          <div className="flex w-full gap-8 px-10">
            {/* Left: Classroom Details */}
            <div className="flex flex-1 flex-col justify-center gap-4">
              <h1 className="text-5xl font-bold text-[#9D9D9D]">
                {classroom.title}
              </h1>

              <p className="max-w-3xl text-lg leading-8 text-[#666]">
                {classroom.description}
              </p>

              <div className="mt-8 flex items-center gap-2">
                <p className="text-base font-semibold tracking-wide text-[#9D9D9D]">
                  Classroom Code:
                </p>

                <p className="text-base font-medium tracking-wide text-[#BDBDBD]">
                  {classroom.code}
                </p>

                <CopyClassroomCodeButton code={classroom.code} />
              </div>
            </div>

            {/* Right: Reaction Time Analytics */}
            <div className="flex flex-1 items-center justify-center">
              <div className="w-full max-w-lg px-2 py-2">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-[#BDBDBD]">
                    Reaction Time vs Score
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
                    <p className="text-2xl font-semibold text-[#8F8F8F]">
                      Average Score:{" "}
                      <span className="text-2xl font-extrabold text-[#8F8F8F]">
                        {classroom.analytics.averageScore}%
                      </span>
                    </p>

                    <p className="text-2xl font-semibold text-[#8F8F8F]">
                      Average Time:{" "}
                      <span className="text-2xl font-extrabold text-[#8F8F8F]">
                        {classroom.analytics.averageReactionTime}s
                      </span>
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  <div className="relative h-50 overflow-hidden rounded-2xl bg-[#F7F7F7] p-4">
                    {/* Guide Lines */}
                    <div className="absolute left-4 right-4 top-1/2 h-px bg-[#E5E5E5]" />
                    <div className="absolute bottom-4 top-4 left-1/2 w-px bg-[#E5E5E5]" />

                    {/* Labels */}
                    <span className="absolute left-4 top-3 text-[10px] font-bold text-[#BDBDBD]">
                      High Score
                    </span>

                    <span className="absolute bottom-3 left-4 text-[10px] font-bold text-[#BDBDBD]">
                      Fast
                    </span>

                    <span className="absolute bottom-3 right-4 text-[10px] font-bold text-[#BDBDBD]">
                      Slow
                    </span>

                    {/* Scatter Points */}
                    {classroom.analytics.points.map((point, index) => {
                      const left = Math.min(
                        (point.reactionTime / 12) * 100,
                        92
                      );

                      const bottom = Math.min(point.score, 90);

                      const pointColor =
                        classroom.analytics.pointColors[
                          index % classroom.analytics.pointColors.length
                        ];

                      return (
                        <div
                          key={index}
                          className="group absolute flex h-4 w-4 items-center justify-center"
                          style={{
                            left: `${left}%`,
                            bottom: `${bottom}%`,
                          }}
                        >
                          {/* Point Glow */}
                          <div
                            className="absolute h-7 w-7 scale-0 rounded-full opacity-20 transition-all duration-300 group-hover:scale-100"
                            style={{ backgroundColor: pointColor }}
                          />

                          {/* Point */}
                          <div
                            className="relative z-10 h-3.5 w-3.5 rounded-full ring-2 ring-white transition-all duration-300 group-hover:scale-150"
                            style={{ backgroundColor: pointColor }}
                          />

                          {/* Hover Label */}
                          <div
                            className="pointer-events-none absolute left-1/2 top-7 z-20 w-max -translate-x-1/2 scale-95 rounded-sm px-2 py-1 text-[6pt] font-semibold leading-none text-white opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100"
                            style={{ backgroundColor: pointColor }}
                          >
                            {point.reactionTime}s · {point.score}%
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs font-semibold text-[#B0B0B0]">
                    <span>Lower reaction time</span>
                    <span>Higher reaction time</span>
                  </div>

                  {/* Point color legend */}
                  <div className="mt-4 flex items-center gap-2">
                    {classroom.analytics.pointColors.map((color, index) => (
                      <div
                        key={index}
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    ))}

                    <span className="ml-1 text-xs font-medium text-[#B0B0B0]">
                      Recent activity points
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Module List */}
        <div className="flex w-full flex-1 flex-col gap-0 bg-white">
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