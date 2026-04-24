import Image from "next/image";

export default function UserDashboard() {
  return (
    <div className="flex h-full w-full flex-col">

      {/* HERO SECTION (fixed height) */}
      <div className="flex flex-[90%] w-full bg-[radial-gradient(ellipse_200.56%_459.76%_at_23.54%_96.38%,_#FFF4C2_0%,_#FFE030_34%,_#EAB300_100%)]">

        {/* LEFT */}
        <div className="flex w-1/2 items-center justify-end">
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
        <div className="flex w-1/2 items-center justify-center">
          <div className="flex flex-col pr-10 text-white items-center text-center space-y-1">

            <h1 className="text-4xl font-bold">
              Let's get started with DysCalc!
            </h1>

            <div className="text-6xl font-bold">
              Lets start your journey!
            </div>

            <div className="text-2xl text-zinc-600 leading-10">
              I am created to teach you learn numbers and math.
            </div>

            <button className="w-48 h-12 rounded-full bg-white text-[#6C6C6C] text-xl font-semibold mt-10 transition-all duration-300 ease-out hover:bg-[#29A177] hover:text-white hover:shadow-lg hover:-translate-y-0.5">
              Start
            </button>

          </div>
        </div>
      </div>

      <div className="flex-[10%]" />
    </div>
  );
}