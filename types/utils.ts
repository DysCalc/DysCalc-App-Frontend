export function toEnumObject<T extends readonly string[]>(arr: T) {
  return Object.fromEntries(arr.map(v => [v, v])) as {
    [K in T[number]]: K;
  };
}