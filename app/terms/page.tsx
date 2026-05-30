"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const termsSections = [
  {
    id: "acceptance-of-terms",
    title: "Acceptance of Terms",
    content: (
      <>
        By accessing and using DysCalc, you agree to follow these Terms of
        Service. These terms apply to all users of the platform, including
        educators, students, and authorized system users. If you do not agree
        with these terms, you should not use the DysCalc platform.
      </>
    ),
  },
  {
    id: "purpose-of-dyscalc",
    title: "Purpose of DysCalc",
    content: (
      <>
        DysCalc is a thesis-level proof-of-concept educational platform designed
        to support early numeracy screening and teacher-guided learning support.
        The system uses machine learning and AI-assisted features to help
        educators review student performance, identify possible numeracy-related
        learning needs, and prepare appropriate learning support.
      </>
    ),
  },
  {
    id: "not-a-diagnostic-tool",
    title: "Not a Diagnostic Tool",
    content: (
      <>
        DysCalc is not a clinical, medical, or psychological diagnostic tool.
        Any screening output produced by the system is intended only as an
        educational screening indicator for educator review. DysCalc should not
        be used as a substitute for professional diagnosis, clinical assessment,
        or formal psychological evaluation.
      </>
    ),
  },
  {
    id: "user-responsibilities",
    title: "User Responsibilities",
    content: (
      <>
        Users are expected to use DysCalc responsibly and only for its intended
        educational purpose. Educators should review system-generated outputs
        before using them for instructional decisions. Students should complete
        assigned assessments and learning activities honestly and with the
        guidance of authorized educators.
      </>
    ),
  },
  {
    id: "educator-review",
    title: "Educator Review and Human Oversight",
    content: (
      <>
        DysCalc is designed as a teacher-guided platform. Machine learning
        outputs and AI-generated learning materials are provided as support tools
        and should be reviewed by educators before being used in student-facing
        activities. The system does not replace teacher judgment, professional
        expertise, or classroom decision-making.
      </>
    ),
  },
  {
    id: "ai-assisted-content",
    title: "AI-Assisted Content",
    content: (
      <>
        DysCalc may use AI or large language model assistance to generate draft
        learning materials, explanations, practice items, or learning path
        suggestions. These generated materials are not automatically considered
        final. Educators are responsible for reviewing, editing, approving, or
        rejecting AI-assisted content before it is assigned to students.
      </>
    ),
  },
  {
    id: "data-and-privacy",
    title: "Data and Privacy",
    content: (
      <>
        DysCalc may process student, educator, classroom, assessment, and
        learning-related information to provide platform functionality. The use
        of this information is further explained in the DysCalc Privacy Policy.
        Users are encouraged to review the Privacy Policy to understand how data
        is collected, used, and protected.

        <div className="mt-5">
          <Link
            href="/privacy"
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#29A177] px-8 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#17815C] hover:shadow-lg"
          >
            View Privacy Policy
          </Link>
        </div>
      </>
    ),
  },
  {
    id: "acceptable-use",
    title: "Acceptable Use",
    content: (
      <>
        Users must not misuse DysCalc, attempt to gain unauthorized access to
        accounts or data, interfere with platform functionality, upload harmful
        content, or use the system for purposes outside its educational and
        research scope. Any misuse of the platform may result in restricted
        access or removal from the system.
      </>
    ),
  },
  {
    id: "prototype-limitation",
    title: "Prototype Limitation",
    content: (
      <>
        DysCalc is currently developed as a thesis-level prototype. It is not yet
        intended for full institutional, clinical, or large-scale classroom
        deployment. Further testing, expert validation, local learner validation,
        and institutional review are needed before broader implementation.
      </>
    ),
  },
  {
    id: "changes-to-terms",
    title: "Changes to These Terms",
    content: (
      <>
        The DysCalc research team may update these Terms of Service when needed
        to reflect system improvements, research requirements, or changes in
        platform functionality. Users should review this page periodically for
        updates.
      </>
    ),
  },
  {
    id: "contact-information",
    title: "Contact Information",
    content: (
      <>
        For questions about these Terms of Service, platform use, or system
        access, users may contact the DysCalc research team.

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

export default function TermsOfService() {
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
    <main className="flex h-full w-full overflow-hidden bg-white">
      <section className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden bg-white">
        {/* Header - fixed / non-scrollable */}
        <section className="w-full shrink-0 border-b border-[#4F70B3] bg-[#6084CC] px-6 py-10 text-white">
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
                DysCalc Legal Notice
              </p>

              <h1 className="mt-2 text-5xl font-extrabold leading-none text-white">
                Terms of Service
              </h1>
            </div>

            <p className="mt-1 text-center text-sm font-medium text-white/75">
              Last Updated in May 30, 2026
            </p>
          </div>
        </section>

        {/* Body */}
        <section className="mx-auto grid min-h-0 w-full max-w-6xl flex-1 grid-cols-1 gap-3 px-6 pb-10 lg:grid-cols-[1fr_2fr]">
          {/* Left Navigation - fixed / non-scrollable */}
          <aside className="h-full overflow-hidden p-6 pt-5">
            <nav className="mt-5 flex flex-col gap-0">
              {termsSections.map((section) => (
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
              {termsSections.map((section) => (
                <TermsSection
                  key={section.id}
                  id={section.id}
                  title={section.title}
                >
                  {section.content}
                </TermsSection>
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

function TermsSection({
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