import {
  type Question,
  type RawQuestion,
  buildChoices,
} from "./utils";

export function buildNumberSeriesQuestions(
  tests: RawQuestion[],
  prompt: string
): Question[] {
  return tests
    .map((test) => {
      if (!Number.isFinite(test.correct)) return null;

      return {
        id: test.id,
        prompt,
        display: test.sequence ?? "",
        correctAnswer: String(test.correct),
        choices: buildChoices(test.correct, test.id),
      };
    })
    .filter((item): item is Question => Boolean(item));
}
