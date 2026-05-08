import LearningPathCard from "@/components/student/LearningPathCard";

type Props = {
  params: {
    studentId: string;
  };
};

const learningPaths = [
  {
    id: "primary",
    title: "Primary Learning Path",
    duration: "63 days (2months+)",
    code: "DSLDKNSA678B",
    accentColor: "#EF4444",
    textColor: "text-[#B5AA3D]",
  },
  {
    id: "secondary",
    title: "Secondary Learning Path",
    duration: "93 days (3months+)",
    code: "DSLDKNSZ924S",
    accentColor: "#29A177",
    textColor: "text-[#55AF55]",
  },
];

export default function StudentClassroomPage({ params }: Props) {
  const { studentId } = params;

  return (
    <main className="min-h-screen w-full bg-[#F7F7F7]">
      {/* HERO */}
      <section className="w-full bg-[radial-gradient(ellipse_120%_120%_at_20%_80%,_#FFF7C8_0%,_#FFE030_40%,_#F4CB00_100%)]">
        <div className="mx-auto flex min-h-[430px] max-w-7xl items-center justify-center px-8 py-10">
          <div className="grid w-full items-center gap-10">
            <div className="flex flex-col items-center text-center">
              <h1 className="max-w-md text-5xl font-extrabold leading-none text-white md:text-6xl">
                Let&apos;s go with your journey!
              </h1>

              <p className="mt-6 text-lg font-semibold text-[#59616B] md:text-xl">
                I am created to teach you learn numbers and math.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-8xl px-8 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          {learningPaths.map((path) => (
            <LearningPathCard
              key={path.id}
              studentId={studentId}
              id={path.id}
              title={path.title}
              duration={path.duration}
              code={path.code}
              textColor={path.textColor}
              accentColor={path.accentColor}
            />
          ))}
        </div>
      </section>
    </main>
  );
}