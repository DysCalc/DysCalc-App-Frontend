import { type Database, Constants } from "@/database.types";
import { toEnumObject } from "./utils";
import { User } from "@supabase/supabase-js";

export type Classroom = Database["public"]["Tables"]["classrooms"]["Row"];
export type Educator = Database["public"]["Tables"]["educator"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Student = Database["public"]["Tables"]["students"]["Row"];
export type StudentInvite = Database["public"]["Tables"]["student_invites"]["Row"]
export type TestResult = Database["public"]["Tables"]["test_results"]["Row"];
export type LearningModule = Database["public"]["Tables"]["learning_modules"]["Row"];
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


export type ClassroomWithStudentCount = Classroom & { student_count: number };

export type EducatorData = {
  created_at: Profile['created_at'];
  sex: Profile['sex'];
  date_of_birth: Profile['date_of_birth'];
  nickname: Profile['nickname'];
  license_id: Educator['license_id'];
  workplace_name: Educator['workplace_name'];
  workplace_address: Educator['workplace_address'];
  undergrad: Educator['undergrad'];
  masters: Educator['masters'];
  doctorate: Educator['doctorate'];
  id: User['id'];
  email: User['email'];
  full_name: User['user_metadata']['full_name'];
  avatar_url: User['user_metadata']['avatar_url'];
}

export type EducatorRow = {
  id: Profile['id'];
  email: User['email'];
  full_name: User['user_metadata']['full_name'];
  avatar_url: User['user_metadata']['avatar_url'];
  nickname: Profile['nickname'];
  classroom_count: number;
};

export type EducatorEducation = {
  program: string;
  school: string;
  year: string;
}

export type StudentClassroomProfile = {
  id: Profile['id'];
  name: User['user_metadata']['full_name'];
  email: User['email'];
  classroom_id: Classroom['id'];
  accepted: StudentInvite['is_accepted'];
  joined_at: Student['joined_at'];
  invited_at: StudentInvite['invited_at'];
  profile: {
    nickname: Profile['nickname'];
    date_of_birth: Profile['date_of_birth'];
    sex: Profile['sex'];
    created_at: Profile['created_at'];
  } | null;
};