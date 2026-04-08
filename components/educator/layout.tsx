import TeacherSidebar from "@/components/educator/TeacherSidebar";
import Footer from "@/components/shared/Footer";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen bg-[#f5f5f0]">
      <TeacherSidebar />

      <div className="flex flex-1 flex-col">
        {/* Content */}
        <div className="flex-1">
          {children}
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </main>
  );
}