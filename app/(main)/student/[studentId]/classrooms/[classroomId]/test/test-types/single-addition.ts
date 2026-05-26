import {
  type Question,
  type RawQuestion,
  buildChoices,
} from "./utils";

export function buildSingleAdditionQuestions(
  tests: RawQuestion[],
  prompt: string
): Question[] {
  return tests
    .map((test) => {
      if (!Number.isFinite(test.correct)) return null;

      return {
        id: test.id,
        prompt,
        display: test.question ?? "",
        correctAnswer: String(test.correct),
        choices: buildChoices(test.correct as number, test.id),
      };
    })
    .filter(Boolean) as Question[];
}
