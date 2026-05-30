import Image from "next/image";

export default function UserDashboard() {
  return (
    <div className="flex h-full w-full flex-col">

      {/* HERO SECTION (fixed height) */}
      <div className="flex h-full w-full bg-[radial-gradient(ellipse_200.56%_459.76%_at_23.54%_96.38%,_#FFF4C2_0%,_#FFE030_34%,_#EAB300_100%)]">

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
        <div className="flex w-1/2 items-center justify-center -ml-10">
          <div className="flex flex-col pr-10 text-white items-center text-center space-y-1">

            <h1 className="text-4xl font-bold text-shadow:0_2px_12px_rgba(0,0,0,0.45)">
              Let's get started with DysCalc!
            </h1>

            <div className="text-6xl font-bold text-shadow:0_2px_12px_rgba(0,0,0,0.45)">
              Lets start your journey!
            </div>

            <div className="text-2xl text-zinc-600 leading-10 text-shadow:0_2px_12px_rgba(0,0,0,0.45)">
              I am created to teach you learn numbers and math.
            </div>

            <button className="w-48 h-12 rounded-full bg-white text-[#6C6C6C] text-xl font-semibold mt-10 transition-all duration-300 ease-out hover:bg-[#29A177] hover:text-white hover:shadow-lg hover:-translate-y-0.5">
              Start
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}