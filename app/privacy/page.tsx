"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Sidebar from "@/components/shared/Sidebar";

const privacySections = [
  {
    id: "introduction",
    title: "Introduction",
    content: (
      <>
        DysCalc is an AI-assisted educational platform designed to support early
        numeracy screening and teacher-guided learning support. We value the
        privacy of students, educators, and other users. This Privacy Policy
        explains what information may be collected, how it is used, and how user
        data is protected within the DysCalc system.
      </>
    ),
  },
  {
    id: "information-we-collect",
    title: "Information We Collect",
    content: (
      <>
        DysCalc may collect basic account information such as name, email
        address, user role, classroom membership, and login-related details. For
        students, the system may store assessment responses, topic progress,
        learning activity results, and classroom-related records. For educators,
        the system may store classroom information, generated learning materials,
        approval actions, and student monitoring records.
      </>
    ),
  },
  {
    id: "how-we-use-information",
    title: "How We Use Information",
    content: (
      <>
        The collected information is used to provide classroom access, administer
        baseline assessments, generate screening-related information for educator
        review, support personalized learning path generation, monitor student
        progress, and improve the functionality and usability of the platform.
      </>
    ),
  },
  {
    id: "student-assessment-data",
    title: "Student Assessment and Screening Data",
    content: (
      <>
        Assessment responses and screening outputs are used only for educational
        support and teacher-guided review. DysCalc does not provide a clinical
        diagnosis of dyscalculia. Screening outputs are intended to help
        educators identify learners who may need additional numeracy support.
      </>
    ),
  },
  {
    id: "ai-assisted-features",
    title: "Use of AI-Assisted Features",
    content: (
      <>
        DysCalc uses machine learning to support screening classification and may
        use large language model assistance to generate draft learning materials.
        AI-generated materials are subject to educator review before student use.
        The system is designed to support educators and does not replace teacher
        judgment.
      </>
    ),
  },
  {
    id: "who-can-access-information",
    title: "Who Can Access Information",
    content: (
      <>
        Student information and assessment-related outputs are accessible only to
        authorized educators and system administrators involved in the educational
        or research process. Students do not directly receive diagnostic
        classifications from the baseline screening assessment.
      </>
    ),
  },
  {
    id: "data-protection",
    title: "Data Protection",
    content: (
      <>
        DysCalc applies role-based access control and limits access to
        information based on user role. Data is stored in the system database and
        is accessed only for platform functionality, validation, research
        documentation, and authorized educational purposes.
      </>
    ),
  },
  {
    id: "data-sharing",
    title: "Data Sharing",
    content: (
      <>
        DysCalc does not sell user data. Student and educator data are not shared
        with third-party organizations for marketing purposes. Any use of data
        for thesis documentation or research reporting will be summarized and
        anonymized whenever applicable.
      </>
    ),
  },
  {
    id: "user-rights",
    title: "User Rights",
    content: (
      <>
        Users may request correction, review, or removal of their information,
        subject to institutional and research requirements. Educators or
        authorized school representatives may contact the researchers or system
        administrator for data-related concerns.
      </>
    ),
  },
  {
    id: "prototype-limitation",
    title: "Prototype Limitation",
    content: (
      <>
        DysCalc is currently a thesis-level proof-of-concept system. It is not
        yet intended for full clinical, medical, or institutional deployment.
        Further review, local validation, and data privacy compliance checks are
        required before classroom-scale implementation.
      </>
    ),
  },
  {
    id: "contact-information",
    title: "Contact Information",
    content: (
      <>
        For questions about privacy, data use, or system access, users may
        contact the DysCalc research team.

        <div className="mt-5">
          <Link
            href="/contacts"
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#29A177] px-8 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#17815C] hover:shadow-lg"
          >
            Go to Contacts
          </Link>
        </div>
      </>
    ),
  },
];

export default function PrivacyPolicy() {
  const detailsScrollRef = useRef<HTMLDivElement | null>(null);

  const handleSectionClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    sectionId: string
  ) => {
    event.preventDefault();

    const container = detailsScrollRef.current;
    const target = document.getElementById(sectionId);

    if (!container || !target) return;

    const containerTop = container.getBoundingClientRect().top;
    const targetTop = target.getBoundingClientRect().top;

    const scrollOffset = targetTop - containerTop + container.scrollTop;

    container.scrollTo({
      top: scrollOffset,
      behavior: "smooth",
    });
  };

  return (
    <main className="flex h-full w-full overflow-hidden bg-[#F7F7F7]">
      <Sidebar />

      <section className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        {/* Header - fixed / non-scrollable */}
        <section className="w-full shrink-0 bg-[#29A177] px-6 py-10 text-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-6">
            <Link
              href="/"
              className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-white/75 transition hover:text-white"
            >
              <ArrowLeft size={18} />
              Back to Home
            </Link>

            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-white/60">
                DysCalc Privacy Notice
              </p>

              <h1 className="mt-2 text-5xl font-extrabold leading-none">
                Privacy Policy
              </h1>
            </div>

            <p className="mt-1 text-center text-sm font-medium text-white">
              Last Updated in May 30, 2026
            </p>
          </div>
        </section>

        {/* Body */}
        <section className="mx-auto grid min-h-0 w-full max-w-6xl flex-1 grid-cols-1 gap-3 px-6 pb-10 lg:grid-cols-[1fr_2fr]">
          {/* Left Navigation - fixed / non-scrollable */}
          <aside className="h-full overflow-hidden p-6 pt-5">
            <nav className="mt-5 flex flex-col gap-0">
              {privacySections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={(event) => handleSectionClick(event, section.id)}
                  className="px-2 py-3 text-lg font-medium leading-tight text-[#6C6C6C] transition-all duration-300 ease-out hover:translate-x-1 hover:bg-[#EFEFEF] hover:text-[#29A177]"
                >
                  {section.title}
                </a>
              ))}
            </nav>
          </aside>

          {/* Right Details - only this part scrolls */}
          <div
            ref={detailsScrollRef}
            className="min-h-0 overflow-y-auto border-l border-[#E5E5E5] px-8 py-10"
          >
            <div className="space-y-10 text-[#5C5E64]">
              {privacySections.map((section) => (
                <PrivacySection
                  key={section.id}
                  id={section.id}
                  title={section.title}
                >
                  {section.content}
                </PrivacySection>
              ))}
            </div>

            <footer className="relative z-10 w-full py-8 text-sm text-zinc-400">
              &copy; {new Date().getFullYear()} DysCalc. All rights reserved.
            </footer>
          </div>
        </section>
      </section>
    </main>
  );
}

function PrivacySection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id}>
      <h2 className="text-2xl font-extrabold leading-tight text-[#29A177]">
        {title}
      </h2>

      <div className="mt-3 text-lg font-normal leading-5 text-[#5C5E64]">
        {children}
      </div>
    </section>
  );
}