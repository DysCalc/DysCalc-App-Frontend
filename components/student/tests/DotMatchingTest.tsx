import type { Question } from "@/app/(main)/student/[studentId]/classrooms/[classroomId]/test/test-types/utils";
import { generateDotGridPositions } from "@/app/(main)/student/[studentId]/classrooms/[classroomId]/test/test-types/utils";

interface Props {
  question: Question;
  selectedAnswer?: string;
  onAnswer: (answer: string) => void;
}

export function DotMatchingTest({ question, selectedAnswer, onAnswer }: Props) {
  return (
    <div className="w-full">
      <h2 className="mt-4 text-4xl font-extrabold text-[#5A5A5A] align-center text-center">
        {question.prompt}
      </h2>

      {question.dotMatching && (
        <div className="mt-6 flex w-full items-center justify-center gap-6">
          <div className="grid h-28 w-36 grid-cols-3 grid-rows-3 place-items-center rounded-2xl border border-[#EFEFEF] bg-[#FAFAFA] px-3 py-3 text-2xl font-semibold text-[#666]">
            {(() => {
              const positions = new Set(
                generateDotGridPositions(
                  question.dotMatching.leftCount,
                  `${question.dotMatching.seed}-left`
                )
              );

              return Array.from({ length: 9 }, (_, index) => (
                <span key={index}>{positions.has(index) ? "●" : ""}</span>
              ));
            })()}
          </div>

          <div className="h-24 w-px bg-[#D0D0D0]" />

          <div className="grid h-28 w-36 grid-cols-3 grid-rows-3 place-items-center rounded-2xl border border-[#EFEFEF] bg-[#FAFAFA] px-3 py-3 text-2xl font-semibold text-[#666]">
            {(() => {
              const positions = new Set(
                generateDotGridPositions(
                  question.dotMatching.rightCount,
                  `${question.dotMatching.seed}-right`
                )
              );

              return Array.from({ length: 9 }, (_, index) => (
                <span key={index}>{positions.has(index) ? "●" : ""}</span>
              ));
            })()}
          </div>
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
