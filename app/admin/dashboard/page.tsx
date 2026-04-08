import Image from "next/image";

export default function AdminDashboard() {
  return (
    <main className="flex bg-[#f5f5f0]">
      <div className="flex flex-col min-h-screen w-full justify-between">
        
        {/* HERO SECTION (fixed height) */}
        <div className="flex h-23/27 w-full bg-[radial-gradient(ellipse_200.56%_459.76%_at_23.54%_96.38%,_#78DAB8_0%,_#29A177_34%,_#076242_100%)]">
          
          {/* LEFT */}
          <div className="w-1/2 flex items-center justify-end">
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

          {/* RIGHT */}
          <div className="w-1/2 flex items-center justify-center">
            <div className="flex flex-col pr-70 items-center text-center space-y-1">

              <div className="text-6xl font-bold text-white">
                Hi admin, Let’s start the work!
              </div>

              <button className="w-48 h-12 rounded-full bg-white text-[#6C6C6C] text-xl font-semibold mt-10 transition-all duration-300 ease-out hover:bg-[#29A177] hover:text-white hover:shadow-lg hover:-translate-y-0.5">
                Let’s get started
              </button>

            </div>
          </div>

        </div>
      </div>
    </main>
  );
}