"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/auth-provider";
import { formatProfile } from "@/hooks/use-profile";

function getHighQualityGoogleAvatar(url: string | null) {
  if (!url) return null;

  return url
    .replace(/=s\d+-c$/, "=s512-c")
    .replace(/=s\d+$/, "=s512")
    .replace(/=w\d+-h\d+-p$/, "=s512-c");
}

export default function StudentProfilePage() {
  const params = useParams<{
    studentId: string;
  }>();

  const { studentId } = params;
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <main className="h-full w-full bg-[#F7F7F7]">
        <section className="flex h-full w-full items-center justify-center bg-[#DED84E]">
          <p className="text-2xl font-bold text-white">Loading profile...</p>
        </section>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="h-full w-full bg-[#F7F7F7]">
        <section className="flex h-full w-full items-center justify-center bg-[#DED84E]">
          <p className="text-2xl font-bold text-white">No user found.</p>
        </section>
      </main>
    );
  }

  const { name, avatar_url } = formatProfile(user, profile);

  const student = {
    name: name || "Student Name",
    avatarUrl: avatar_url || null,
    age: 7,
    classification: "C-",
    setup: "Home School Setup",
  };

  const highQualityAvatarUrl = getHighQualityGoogleAvatar(student.avatarUrl);

return (
  <main className="h-full w-full overflow-hidden bg-[#F7F7F7]">
    <section className="flex h-full w-full flex-col overflow-hidden bg-[#DED84E] px-6 py-10">
      {/* Back */}
      <div className="shrink-0">
        <Link
          href={`/student/${studentId}/classrooms`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-white transition-colors duration-300 hover:text-[#29A177]"
        >
          <ArrowLeft size={18} />
          Back to Classrooms
        </Link>
      </div>

      {/* Center Content */}
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
        {/* Profile Avatar */}
        <div className="relative flex items-center justify-center">
          <div className="absolute h-[340px] w-[340px] rounded-full border-2 border-dashed border-[#BEB844]/80" />

          <div className="relative flex h-[300px] w-[300px] items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
            {highQualityAvatarUrl ? (
              <Image
                src={highQualityAvatarUrl}
                alt={student.name}
                width={512}
                height={512}
                quality={100}
                priority
                className="h-full w-full object-cover"
              />
            ) : (
              <Image
                src="/icons/main-icon.svg"
                alt="DysCalc Student Avatar"
                width={220}
                height={220}
                priority
                className="h-auto w-[220px] object-contain"
              />
            )}
          </div>
        </div>

        {/* Student Info */}
        <div className="mt-12 flex flex-col items-center text-center">
          <h1 className="max-w-4xl text-5xl font-extrabold leading-none text-white">
            {student.name}
          </h1>

          <p className="mt-4 text-3xl font-semibold leading-none text-white">
            Age: {student.age} Classification: {student.classification}
          </p>

          <p className="mt-9 text-2xl font-semibold text-white">
            {student.setup}
          </p>

          <div className="mt-8 inline-flex rounded-full bg-white/20 px-6 py-2 backdrop-blur-sm">
            <p className="text-sm font-semibold tracking-wide text-white">
              Student ID: {studentId}
            </p>
          </div>
        </div>
      </div>
    </section>
  </main>
);
}