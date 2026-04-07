import { type Database, Constants } from "@/database.types";
import { toEnumObject } from "./utils";

export type Classrooms = Database["public"]["Tables"]["classrooms"]["Row"];
export type Educator = Database["public"]["Tables"]["educator"]["Row"];
export type InitialTestClassification = Database["public"]["Tables"]["initial_test_classification"]["Row"];
export type Profiles = Database["public"]["Tables"]["profiles"]["Row"];
export type StudentInvites = Database["public"]["Tables"]["student_invites"]["Row"];
export type InitialTestResults = Database["public"]["Tables"]["initial_test_results"]["Row"];
export type Students = Database["public"]["Tables"]["students"]["Row"];


// Enums
export type Classification = typeof Constants.public.Enums.CLASSIFICATION[number];
export type Role = typeof Constants.public.Enums.ROLE[number];
export type Sex = typeof Constants.public.Enums.SEX[number];

// Use these only like Classification.TYPICAL
export const ClassificationEnum = toEnumObject(
  Constants.public.Enums.CLASSIFICATION
) satisfies Record<string, Classification>;
export const RoleEnum = toEnumObject(
  Constants.public.Enums.ROLE
) satisfies Record<string, Role>;
export const SexEnum = toEnumObject(
  Constants.public.Enums.SEX
) satisfies Record<string, Sex>;
