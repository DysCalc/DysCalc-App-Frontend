import Image from "next/image";


export default function AdminDashboard() {
  return (
    <main className="flex bg-[#f5f5f0]">
      <div className="flex flex-col min-h-screen w-full justify-between">

        {/* HERO SECTION (fixed height) */}
        <div className="flex h-full w-full bg-[radial-gradient(ellipse_200.56%_459.76%_at_23.54%_96.38%,_#78DAB8_0%,_#29A177_34%,_#076242_100%)]">
          {/* LEFT */}
          <div className="flex w-1/2 items-center justify-end">
            <div className="flex flex-1 items-center justify-end -mr-20">
              <Image
                src="/icons/main-icon.svg"
                alt="DysCalc Logo"
                width={650}
                height={650}
                className="dyscalc-swell-pulse-shrink-bounce-disappear object-contain"
                priority
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