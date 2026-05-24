import {
  type Question,
  type RawQuestion,
  parsePair,
  shouldSwapPair,
} from "./utils";

export function buildDotMatchingQuestions(
  tests: RawQuestion[],
  prompt: string
): Question[] {
  return tests
    .map((test) => {
      const pair = parsePair(test.question ?? "");
      const leftCount = pair?.[0];
      const rightCount = pair?.[1];

      if (!Number.isFinite(leftCount) || !Number.isFinite(rightCount)) {
        return null;
      }

      const shouldSwap = shouldSwapPair(test.id);
      const firstCount = shouldSwap ? rightCount : leftCount;
      const secondCount = shouldSwap ? leftCount : rightCount;

      return {
        id: test.id,
        prompt,
        dotMatching: {
          leftCount: firstCount,
          rightCount: secondCount,
          seed: test.id,
        },
        correctAnswer: test.match ? "True" : "False",
        choices: ["True", "False"],
      };
    })
    .filter((item): item is Question => Boolean(item));
}
