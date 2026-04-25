export const CLASSROOM_VARIANTS = ["yellow", "green", "blue", "gray"] as const;

export type ClassroomVariant = (typeof CLASSROOM_VARIANTS)[number];

export const headerStyles: Record<
  ClassroomVariant,
  { bg: string; title: string; sub: string }
> = {
  yellow: {
    bg: "bg-[#E3D860]",
    title: "text-[#827D2A]",
    sub: "text-[#827D2A]/80",
  },
  green: {
    bg: "bg-[#29A177]",
    title: "text-white",
    sub: "text-white/80",
  },
  blue: {
    bg: "bg-[#608CCC]",
    title: "text-white",
    sub: "text-white/80",
  },
  gray: {
    bg: "bg-[#6C6C6C]",
    title: "text-white",
    sub: "text-white/80",
  },
};

export function getClassroomVariant(seed: string): ClassroomVariant {
  if (!seed) return CLASSROOM_VARIANTS[0];

  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(index);
    hash |= 0;
  }

  const safeIndex = Math.abs(hash) % CLASSROOM_VARIANTS.length;
  return CLASSROOM_VARIANTS[safeIndex];
}