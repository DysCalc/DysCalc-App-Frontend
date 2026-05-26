import type { Question } from "@/app/(main)/student/[studentId]/classrooms/[classroomId]/test/test-types/utils";

interface Props {
  question: Question;
  selectedAnswer?: string;
  onAnswer: (answer: string) => void;
}

export function NumberComparisonTest({ question, selectedAnswer, onAnswer }: Props) {
  return (
    <div className="w-full">
      <h2 className="mt-4 text-3xl font-extrabold text-[#5A5A5A]">
        {question.prompt}
      </h2>

      {question.display && (
        <div className="mt-6 whitespace-pre-wrap rounded-2xl border border-[#EFEFEF] bg-[#FAFAFA] px-6 py-5 text-center text-2xl font-semibold text-[#666]">
          {question.display}
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {question.choices.map((choice) => (
          <button
            key={choice}
            type="button"
            onClick={() => onAnswer(choice)}
            className={`flex min-h-[64px] items-center justify-center rounded-2xl border text-lg font-semibold transition-all ${
              selectedAnswer === choice
                ? "border-[#29A177] bg-[#29A177]/10 text-[#1F7A58]"
                : "border-[#E5E5E5] bg-white text-[#666] hover:border-[#BFBFBF]"
            }`}
          >
            {choice}
          </button>
        ))}
      </div>
    </div>
  );
}
