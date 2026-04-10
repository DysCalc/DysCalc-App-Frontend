// app/educator/classroom/data.ts

export const classroomMap = {
  cls_001: {
    id: "cls_001",
    title: "2023 SpEd Iligan City",
    students: 8,
    variant: "yellow",
  },
  cls_002: {
    id: "cls_002",
    title: "2025 SpEd Lanao del Norte",
    students: 21,
    variant: "green",
  },
  cls_003: {
    id: "cls_003",
    title: "Class 3",
    students: 10,
    variant: "blue",
  },
  cls_004: {
    id: "cls_004",
    title: "2025 Computer Science SpEd",
    students: 15,
    variant: "green",
  },
  cls_005: {
    id: "cls_005",
    title: "2026 MSUIIT SpEd Center",
    students: 24,
    variant: "yellow",
  },
} as const;


export const headerStyles = {
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

export const students = [
  { id: "s1", name: "Juan Dela Cruz" },
  { id: "s2", name: "Maria Santos" },
  { id: "s3", name: "Pedro Reyes" },
  { id: "s4", name: "Ana Lopez" },
  { id: "s5", name: "Carlos Mendoza" },
  { id: "s6", name: "Liza Ramos" },
  { id: "s7", name: "Mark Bautista" },
  { id: "s8", name: "Ella Cruz" },
  { id: "s9", name: "John Lim" },
  { id: "s10", name: "Paolo Garcia" },
  { id: "s11", name: "Kim Torres" },
  { id: "s12", name: "Nina Flores" },
];
