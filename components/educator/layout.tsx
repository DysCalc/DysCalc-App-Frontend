import TeacherSidebar from "@/components/educator/TeacherSidebar";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen bg-[#f5f5f0]">
      <TeacherSidebar />

      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </main>
  );
}