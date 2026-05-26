import {
  type Question,
  type RawQuestion,
  buildPairChoices,
  parsePair,
} from "./utils";

export function buildNumberComparisonQuestions(
  tests: RawQuestion[],
  prompt: string
): Question[] {
  return tests
    .map((test) => {
      const pair = parsePair(test.question ?? "");

      if (!pair || !Number.isFinite(test.correct)) return null;

      return {
        id: test.id,
        prompt,
        display: test.question ?? "",
        correctAnswer: String(test.correct),
        choices: [String(pair[0]), String(pair[1])],
      };
    })
    .filter(Boolean) as Question[];
}
