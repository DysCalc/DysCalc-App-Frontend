"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft} from "lucide-react";

const teamMembers = [
  {
    name: "Caine Ivan Bautista",
    email: "member.two@g.msuiit.edu.ph",
    school: "MSU-Iligan Institute of Technology",
    address: "Iligan City, Philippines",
    type: "Thesis Proponent",
    image: "/contacts/member-two.png",
    fieldContribution: ["Backend Development", "Database Management", "System Integration", "Research Writing"],
    sentiment:
      "This project helps bridge technology and education by giving teachers practical tools to understand student needs and provide timely learning support.",
  },
  {
    name: "Angelyn Jimeno",
    email: "member.three@g.msuiit.edu.ph",
    school: "MSU-Iligan Institute of Technology",
    address: "Iligan City, Philippines",
    type: "Thesis Proponent",
    image: "/contacts/member-three.png",
    fieldContribution: ["LLM Design", "Learning Path Design", "Documentation", "Research Writing"],
    sentiment:
      "DysCalc was designed to create a friendlier learning experience for children while helping educators make informed decisions based on meaningful student progress.",
  },
  {
    name: "Kristoffer Neo Senyahan",
    email: "kristofferneo.senyahan@g.msuiit.edu.ph",
    school: "MSU-Iligan Institute of Technology",
    address: "Iligan City, Philippines",
    type: "Thesis Proponent",
    image: "/contacts/neo.png",
    fieldContribution: ["Machine Learning", "Frontend Development", "UI/UX Design", "Research Writing"],
    sentiment:
      "DysCalc aims to support learners through early numeracy screening, teacher-guided interpretation, and personalized learning assistance that makes mathematics less intimidating and more supportive.",
  },
  {
    name: "Jennifer Joyce Montemayor",
    email: "adviser@g.msuiit.edu.ph",
    school: "MSU-Iligan Institute of Technology",
    address: "Iligan City, Philippines",
    type: "Thesis Adviser",
    image: "/contacts/adviser.png",
    fieldContribution: ["Research Supervision", "Technical Review", "Academic Guidance"],
    sentiment:
      "The project encourages responsible use of AI in education by keeping teachers involved in screening interpretation, content review, and instructional decision-making.",
  },
];

const CONTRIBUTION_COLORS = [
  "#E3D860", "#29A177", "#607BCC",
  "#FADA4B", "#FF754E", "#F64649",
];

export default function ContactsPage() {
  return (
    <main className="flex h-full w-full overflow-hidden bg-white">
      <section className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden bg-white">
        {/* Header - fixed / non-scrollable */}
        <section className="w-full shrink-0 border-b border-[#D8CC54] bg-[#E3D860] px-6 py-10 text-[#5C5E64]">
            <div className="mx-auto flex max-w-6xl flex-col gap-6">
                <Link
                    href="/"
                    className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#6C6C6C] transition hover:text-[#29A177]"
                    >
                    <ArrowLeft size={18} />
                    Back to Home
                </Link>

                <div className="text-center">
                    <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#827D2A]/70">
                        DysCalc Research Team
                    </p>

                    <h1 className="mt-2 text-5xl font-extrabold leading-none text-white">
                        Behind the Application
                    </h1>
                </div>

                <p className="mx-auto max-w-4xl text-center text-base font-medium leading-5 text-[#827D2A]/70">
                DysCalc is a proof-of-concept thesis project developed by BS
                Computer Science students from MSU-Iligan Institute of Technology.
                </p>
            </div>
        </section>

        {/* Body */}
        <section className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2 xl:grid-cols-4">
            {teamMembers.map((member, index) => (
              <ProfileCard key={member.name} member={member} index={index} />
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function ProfileCard({
  member,
  index,
}: {
  member: (typeof teamMembers)[number];
  index: number;
}) {
  const isAdviser = member.type.toLowerCase().includes("adviser");

  return (
    <article className="group relative min-h-[590px] overflow-hidden p-5 pb-16 shadow-[0_18px_60px_rgba(0,0,0,0.08)] ring-1 ring-[#EDEDED] transition-all duration-300 hover:-translate-y-1">
      {/* Image */}
      <div className="relative flex h-[210px] items-center justify-center">
        <div className="relative h-[150px] w-[150px] rounded-full bg-[#F1F1F1] transition-all duration-500 group-hover:ring-[6px] group-hover:ring-[#6C6C6C]/15">
          <div className="relative h-full w-full overflow-hidden rounded-full">
            <Image
              src={member.image}
              alt={member.name}
              fill
              sizes="150px"
              className="object-cover transition duration-500 group-hover:scale-105"
              priority={index === 0}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-2 pt-2">
        <p
          className={`text-xs font-medium uppercase tracking-[0.1em] ${
            isAdviser ? "text-[#29A177]" : "text-[#B8B8B8]"
          }`}
        >
          {member.type}
        </p>

        {/* Name */}
        <h2 className="mt-2 text-xl font-semibold leading-none text-[#333333]">
          {member.name}
        </h2>

        {/* Course */}
        <p className="mt-5 text-sm font-medium leading-4 text-[#5C5E64]">
          Bachelor of Science in Computer Science
        </p>

        {/* School */}
        <p className="text-sm font-normal leading-none text-[#5C5E64]">
          {member.school}
        </p>

        {/* Address */}
        <p className="text-sm font-normal leading-none text-[#777777]">
          {member.address}
        </p>

        {/* Field Contribution */}
        <div className="mt-7">
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-[#B8B8B8]">
            Field Contribution
          </p>

          <div className="mt-3 flex flex-wrap gap-1">
            {member.fieldContribution.map(
              (contribution, contributionIndex) => {
                const color =
                  CONTRIBUTION_COLORS[
                    contributionIndex % CONTRIBUTION_COLORS.length
                  ];

                return (
                  <span
                    key={contribution}
                    className="inline-flex items-center rounded-3xl border border-white/50 px-2.5 py-1 text-[11px] font-normal text-white"
                    style={{
                      backgroundColor: color,
                      boxShadow: `0 0 24px 8px ${color}1A`,
                    }}
                  >
                    {contribution}
                  </span>
                );
              }
            )}
          </div>
        </div>
      </div>

      {/* Email - fixed at bottom */}
      <Link
        href={`mailto:${member.email}`}
        className="absolute bottom-8 left-7 right-7 inline-flex items-center justify-center gap-2 rounded-full bg-[#F7F7F7] px-4 py-2.5 text-center text-sm font-semibold text-[#5C5E64] transition hover:bg-[#29A177] hover:text-white"
      >
        Email Researcher
      </Link>
    </article>
  );
}