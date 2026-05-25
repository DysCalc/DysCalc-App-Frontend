import {
  type Question,
  type RawQuestion,
  shuffle,
  shuffleWithSeed
} from "./utils";

export function buildNumberSeriesChoices(correct: number, seedKey?: string) {
  // offset determines where 'correct' sits in the 4 sorted choices (index 1 or 2)
  // We'll use seededRandom if seedKey is provided, otherwise Math.random
  const hashString = (value: string) => {
    let hash = 0;
    for (let index = 0; index < value.length; index += 1) {
      hash = (hash << 5) - hash + value.charCodeAt(index);
      hash |= 0;
    }
    return Math.abs(hash);
  };
  
  const randomVal = seedKey ? 
    (Math.sin(hashString(seedKey)) * 10000 - Math.floor(Math.sin(hashString(seedKey)) * 10000)) : 
    Math.random();

  const offset = Math.floor(randomVal * 2) + 1; // 1 or 2
  
  // Make choices around the correct answer so it acts as a median
  const choices = [
    correct - offset, 
    correct - offset + 1, 
    correct - offset + 2, 
    correct - offset + 3
  ];

  const choiceStrings = choices.map(String);

  if (seedKey) {
    return shuffleWithSeed(choiceStrings, seedKey);
  }

  return shuffle(choiceStrings);
}

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
        choices: buildNumberSeriesChoices(test.correct as number, test.id),
      };
    })
    .filter((item): item is Question => Boolean(item));
}
