export type RawQuestion = {
  id: string;
  question?: string;
  sequence?: string;
  correct?: number;
  match?: boolean;
};

export type Question = {
  id: string;
  prompt: string;
  display?: string;
  dotMatching?: {
    leftCount: number;
    rightCount: number;
    seed: string;
  };
  correctAnswer: string;
  choices: string[];
};

export function parsePair(value: string) {
  const parts = value.split(" vs ").map((item) => item.trim());

  if (parts.length !== 2) return null;

  const left = Number(parts[0]);
  const right = Number(parts[1]);

  if (!Number.isFinite(left) || !Number.isFinite(right)) return null;

  return [left, right] as const;
}

export function renderDots(dotCount: number) {
  return Array.from({ length: dotCount }, () => "●").join(" ");
}

export function renderDotPair(leftCount: number, rightCount: number) {
  const leftDots = renderDots(leftCount);
  const rightDots = renderDots(rightCount);
  return `${leftDots}   |   ${rightDots}`;
}

export function shuffle(values: string[]) {
  const items = [...values];

  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
  }

  return items;
}

function hashString(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}

export function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function shuffleWithSeed(values: string[], seedKey: string) {
  const items = [...values];
  const baseSeed = hashString(seedKey);

  for (let index = items.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(
      seededRandom(baseSeed + index) * (index + 1)
    );
    [items[index], items[randomIndex]] = [items[randomIndex], items[index]];
  }

  return items;
}

export function shouldSwapPair(seedKey: string) {
  return seededRandom(hashString(seedKey)) < 0.5;
}

export function shouldJumbleDots(seedKey: string) {
  return seededRandom(hashString(seedKey)) < 0.4;
}

export function renderJumbledDots(dotCount: number, seedKey: string) {
  const rows = Math.max(2, Math.min(4, 2 + Math.floor(seededRandom(hashString(seedKey)) * 3)));
  const base = Math.floor(dotCount / rows);
  let remainder = dotCount % rows;
  const rowCounts = Array.from({ length: rows }, (_, index) => {
    const extra = remainder > 0 ? 1 : 0;
    remainder -= extra;
    return base + extra;
  });

  const lines = rowCounts
    .map((count, index) => {
      const jitter = 1 + Math.floor(seededRandom(hashString(`${seedKey}:${index}`)) * 3);
      return `${" ".repeat(jitter)}${renderDots(count)}`.trimEnd();
    });

  return lines.join("\n");
}

export function renderJumbledDotsLines(dotCount: number, seedKey: string) {
  return renderJumbledDots(dotCount, seedKey).split("\n");
}

export function shuffleQuestions(items: Question[]) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

export function buildChoices(correct: number, seedKey?: string, maxOption: number = 10) {
  const choices = new Set<number>();
  choices.add(correct);

  while (choices.size < 4) {
    const option = Math.floor(Math.random() * maxOption);
    if (option !== correct) {
      choices.add(option);
    }
  }

  const choiceStrings = Array.from(choices).map(String);

  if (seedKey) {
    return shuffleWithSeed(choiceStrings, seedKey);
  }

  return shuffle(choiceStrings);
}

export function buildPairChoices(left: number, right: number, seedKey?: string) {
  const options = [String(left), String(right)];

  if (seedKey) {
    return shuffleWithSeed(options, seedKey);
  }

  return shuffle(options);
}

export function generateDotGridPositions(count: number, seedKey: string) {
  const totalSlots = 9;
  const slots = Array.from({ length: totalSlots }, (_, index) => index);
  const shuffled = shuffleWithSeed(slots.map(String), seedKey).map(Number);
  return shuffled.slice(0, Math.min(count, totalSlots));
}
