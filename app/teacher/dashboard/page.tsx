import Image from "next/image";
import Sidebar from "@/components/shared/Sidebar";
import Footer from "@/components/shared/Footer";

export default function TeacherDashboard() {
  return (
    <main className="flex min-h-screen bg-[#f5f5f0]">
      <Sidebar />

      <div className="flex flex-col justify-between">
        <div className="flex w-full h-[802px] bg-[radial-gradient(ellipse_200.56%_459.76%_at_23.54%_96.38%,_#CCE6FF_0%,_#E6F8FF_42%,_#D1D6FF_100%)]">

          <div className="w-1/2 flex items-center justify-right">

            <div className="ml-30">
              <Image
                src="/icons/main-icon.svg"
                alt="DysCalc Icon"
                width={600}
                height={600}
                className="shrink-0 mr-50 object-contain"
              />

            </div>
          </div>
          
          <div className="w-1/2 flex items-center justify-center">
            <div className="flex flex-col pr-40 items-center text-center space-y-0.5">
              
              <h1 className="text-4xl font-bold text-[#5C5E64] text-zinc-600">
                Welcome
              </h1>

              <div className="text-6xl font-bold text-[#5C5E64] text-zinc-600">
                Hi there, I'm Matha!
              </div>
              <div className="text-zinc-600 text-2xl font-regular text-[#5C5E64] leading-10">Hi admin, Let’s start the work!</div>

              <button className="w-48 h-12 rounded-full bg-white text-[#6C6C6C] text-xl font-semibold mt-10 transition-all duration-300 ease-out hover:bg-[#29A177] hover:text-white hover:shadow-lg hover:-translate-y-0.5]">
                Let’s get started
              </button>

            </div>
          </div>

        </div>
        <Footer />
      </div>
    </main>
  );
}
