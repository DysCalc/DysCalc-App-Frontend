import {
  type Question,
  type RawQuestion,
  shuffle,
  shuffleWithSeed,
} from "./utils";

export function buildComplexArithmeticChoices(correct: number, seedKey?: string) {
  const hashString = (value: string) => {
    let hash = 0;
    for (let index = 0; index < value.length; index += 1) {
      hash = (hash << 5) - hash + value.charCodeAt(index);
      hash |= 0;
    }
    return Math.abs(hash);
  };

  const randomVal1 = seedKey ?
    (Math.sin(hashString(seedKey)) * 10000 - Math.floor(Math.sin(hashString(seedKey)) * 10000)) :
    Math.random();

  const randomVal2 = seedKey ?
    (Math.sin(hashString(seedKey + "_step")) * 10000 - Math.floor(Math.sin(hashString(seedKey + "_step")) * 10000)) :
    Math.random();

  let offsetIndex = Math.floor(randomVal1 * 2) + 1; // 1 or 2
  const step = Math.floor(randomVal2 * 5) + 1; // 1 to 5

  // Adjust offsetIndex so we don't go below 0
  while (correct - (step * offsetIndex) < 0 && offsetIndex > 0) {
    offsetIndex--;
  }

  // If correct is within normal range, adjust offsetIndex so we don't go above 1000
  if (correct <= 1000) {
    while (correct + (step * (3 - offsetIndex)) > 1000 && offsetIndex < 3) {
      offsetIndex++;
    }
  }

  const choices = [
    correct - (step * offsetIndex),
    correct - (step * (offsetIndex - 1)),
    correct - (step * (offsetIndex - 2)),
    correct - (step * (offsetIndex - 3))
  ];

  const choiceStrings = Array.from(new Set(choices)).map(String);

  // If we ended up with fewer than 4 distinct choices (shouldn't happen with step >= 1), fallback
  while (choiceStrings.length < 4) {
    let fallback = Math.floor(Math.random() * (correct <= 1000 ? 1000 : correct + 100));
    choiceStrings.push(String(fallback));
  }

  if (seedKey) {
    return shuffleWithSeed(choiceStrings.slice(0, 4), seedKey);
  }

  return shuffle(choiceStrings.slice(0, 4));
}

export function buildComplexArithmeticQuestions(
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
        choices: buildComplexArithmeticChoices(test.correct as number, test.id),
      };
    })
    .filter(Boolean) as Question[];
}
