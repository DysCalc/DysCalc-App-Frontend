import Link from "next/link";
import { ArrowLeft, Clock3, ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  params: Promise<{
    studentId: string;
    classroomId: string;
    testId: string;
  }>;
};

const testData = {
  "test-examination": {
    title: "Test Examination",
    subtitle: "Mathematical Reasoning",
    instruction: "Read each question carefully and choose the correct answer.",
    totalItems: 10,
    timeLimit: "15:00",
  },
  "number-system": {
    title: "Number System",
    subtitle: "Mathematical Reasoning",
    instruction: "Answer the following number system questions.",
    totalItems: 8,
    timeLimit: "20:00",
  },
  "comparison-test": {
    title: "Comparison Test",
    subtitle: "Mathematical Reasoning",
    instruction: "Compare the numbers and choose the correct answer.",
    totalItems: 10,
    timeLimit: "18:00",
  },
  shapes: {
    title: "Shapes",
    subtitle: "Mathematical Reasoning",
    instruction: "Identify the shapes shown in each item.",
    totalItems: 12,
    timeLimit: "25:00",
  },
};

const sampleQuestion = {
  number: 1,
  question: "Which number is bigger?",
  choices: ["3", "8", "5", "1"],
};

export default async function StudentTestPage({ params }: Props) {
  const { studentId, classroomId, testId } = await params;

  const test =
    testData[testId as keyof typeof testData] ?? testData["test-examination"];

  return (
    <main className="min-h-screen w-full bg-[#F7F7F7]">
      <section className="flex min-h-screen w-full flex-col">
        {/* Top Navigation */}
        <div className="flex items-center justify-between px-6 pt-8">
          <Link
            href={`/student/${studentId}/classrooms/${classroomId}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#9A9A9A] transition hover:text-[#555]"
          >
            <ArrowLeft size={18} />
            Back to Learning Path
          </Link>

          <div className="flex items-center gap-2 rounded-full bg-white mr-7 px-5 py-2 ext-sm font-semibold text-[#9A9A9A] shadow-sm">
            <Clock3 size={16} />
            {test.timeLimit}
          </div>
        </div>

        {/* Header */}
        <section className="flex w-full flex-[1] items-center px-6">
          <div className="flex w-full items-end justify-between gap-5 px-7 py-0">
            <div className="flex flex-col gap-0">
                <div className="flex items-baseline gap-4">
                    <h1 className="text-4xl font-bold leading-none text-[#9D9D9D]">
                        {test.title}
                    </h1>

                    <p className="pb-1 text-lg font-semibold text-[#29A177]">
                        {test.subtitle}
                    </p>
                </div>

                <p className="max-w-3xl text-lg text-[#666]">
                    {test.instruction}
                </p>
            </div>

            <div className="hidden px-6 py-0 md:flex md:flex-col md:items-center md:justify-center">
              <p className="text-base font-bold uppercase tracking-wide text-[#B8B8B8]">
                Progress
              </p>
              <p className="mt-1 text-4xl font-bold text-[#9D9D9D]">
                1 / {test.totalItems}
              </p>
            </div>
          </div>
        </section>

        {/* Test Body */}
        <section className="flex w-full flex-[2] flex-col bg-white">
          {/* Progress Bar */}
          <div className="h-2 w-full bg-[#EFEFEF]">
            <div className="h-full w-[10%] bg-[#29A177]" />
          </div>

          {/* Question Area */}
          <div className="flex flex-1 items-center justify-center px-6 py-6">
            <div className="grid w-full max-w-6xl grid-cols-[80px_1fr_80px] items-center gap-6">
              {/* Previous */}
              <button
                type="button"
                className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F2F2F2] text-[#B5B5B5] transition hover:bg-[#E8E8E8] hover:text-[#777]"
              >
                <ChevronLeft size={36} />
              </button>

              {/* Question Card */}
              <div className="border border-[#E9E9E9] bg-[#FAFAFA] px-10 py-12 shadow-[0_18px_50px_rgba(0,0,0,0.04)]">
                <div className="flex items-center justify-between gap-5">
                  <p className="text-sm font-bold uppercase tracking-wide text-[#BDBDBD]">
                    Question #{sampleQuestion.number}
                  </p>

                  <div className="rounded-full bg-[#DFF5EC] px-4 py-1 text-sm font-bold text-[#29A177]">
                    Not answered
                  </div>
                </div>

                <h2 className="mt-8 text-center text-4xl font-bold leading-tight text-[#666]">
                  {sampleQuestion.question}
                </h2>

                <div className="mt-12 grid gap-5 sm:grid-cols-2">
                  {sampleQuestion.choices.map((choice) => (
                    <button
                      key={choice}
                      type="button"
                      className="flex h-24 items-center justify-center rounded-2xl border border-[#E5E5E5] bg-white text-4xl font-bold text-[#777] transition-colors duration-300 hover:border-[#29A177] hover:bg-[#DFF5EC] hover:text-[#29A177]"
                    >
                      {choice}
                    </button>
                  ))}
                </div>
              </div>

              {/* Next */}
              <button
                type="button"
                className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F2F2F2] text-[#B5B5B5] transition hover:bg-[#E8E8E8] hover:text-[#777]"
              >
                <ChevronRight size={36} />
              </button>
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="flex items-center justify-between border-t border-[#E5E5E5] px-[60px] py-5">
            <div className="flex items-center gap-3">
              {Array.from({ length: test.totalItems }).map((_, index) => (
                <div
                  key={index}
                  className={`h-3 w-3 ${
                    index === 0 ? "bg-[#29A177]" : "bg-[#D9D9D9]"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              className="flex h-11 min-w-[150px] items-center justify-center rounded-md bg-[#29A177] px-10 text-lg font-bold text-white transition-colors duration-300 hover:bg-[#FFCC00] active:bg-[#EAB300]"
            >
              Next
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}