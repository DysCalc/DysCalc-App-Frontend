import Image from "next/image";

export default function TeacherDashboard() {
  return (
    <div className="flex h-full w-full flex-col">

      {/* HERO = 80% (matches sidebar 2 + 6) */}
      <div className="flex flex-[85%] w-full bg-[radial-gradient(ellipse_200.56%_459.76%_at_23.54%_96.38%,_#CCE6FF_0%,_#E6F8FF_42%,_#D1D6FF_100%)]">
        
        {/* LEFT */}
        <div className="flex w-1/2 items-center justify-end">
          <div className="ml-30">
            <Image
              src="/icons/main-icon.svg"
              alt="DysCalc Icon"
              width={600}
              height={600}
              className="mr-50 shrink-0 object-contain"
            />
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex w-1/2 items-center justify-center">
          <div className="flex flex-col items-center text-center space-y-1 pr-40">
            
            <h1 className="text-4xl font-bold text-zinc-600">
              Welcome
            </h1>

            <div className="text-6xl font-bold text-zinc-600">
              Hi there, I'm Matha!
            </div>

            <div className="text-2xl text-zinc-600 leading-10">
              Hi admin, Let’s start the work!
            </div>

            <button className="mt-10 h-12 w-48 rounded-full bg-white text-xl font-semibold text-[#6C6C6C] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#29A177] hover:text-white hover:shadow-lg">
              Let’s get started
            </button>

          </div>
        </div>
      </div>

      {/* BOTTOM SPACE = 20% (matches sidebar avatar section) */}
      <div className="flex-[15%]" />

    </div>
  );
}