import UserSidebar from "@/components/user/UserSidebar";
import Footer from "@/components/shared/Footer";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen bg-[#f5f5f0]">
      <UserSidebar />

      <div className="flex flex-1 flex-col">
        <div className="flex-1">
          {children}
        </div>
        <Footer />
      </div>
    </main>
  );
}