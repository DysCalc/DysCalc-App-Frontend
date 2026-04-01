import { ArrowsRightLeftIcon, ChevronDownIcon, ChevronRightIcon, Cog8ToothIcon, EllipsisVerticalIcon, HomeIcon, NewspaperIcon } from "@heroicons/react/24/outline";

export default function Sidebar() {
  return (
    <aside className="flex h-screen w-1/5 flex-col gap-0 justify-between bg-white ">
      <div>
        {/* Logo */}
        <div className="bg-[#FAFAFA] border-b border-[#D9D9D9] flex items-center justify-between px-8 py-8 group">
          <h1 className="text-2xl font-extrabold tracking-wide text-[#29A177]">DYSCALC</h1>

          <div className="relative flex items-center">
            
            {/* Floating arrow */}
            <div className="absolute -right-11 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200">
              <div className="bg-white border border-gray-300 rounded-md p-1 shadow-sm">
                <ArrowsRightLeftIcon className="w-5 h-5 text-gray-500" />
              </div>
            </div>
            <button className="text-gray-500 hover:text-primary transition-colors">
              <EllipsisVerticalIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
    

        <nav className="px-8 py-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Main</p>

          <div className="space-y-4">
            <a
              href="/dashboard"
              className="flex items-center gap-3 text-xl text-gray-700 hover:text-primary transition-colors duration-200">
              <HomeIcon className="w-5 h-5" />
              <span>Dashboard</span>
            </a>

            <a
              href="/posts"
              className="flex items-center gap-3 text-xl text-gray-700 hover:text-primary transition-colors duration-200">
              <NewspaperIcon className="w-5 h-5" />
              <span>Posts</span>
            </a>
          </div>

          <p className="mb-4 mt-10 text-xs font-semibold uppercase tracking-wider text-gray-400">Settings</p>

          <a
            href="/settings"
            className="flex items-center justify-between text-xl text-gray-700 hover:text-primary transition-colors duration-200">
            <div className="flex items-center gap-3">
              <Cog8ToothIcon className="w-5 h-5" />
              <span>Settings</span>
            </div>

            <div className="group/icon p-1">
              <ChevronRightIcon className="w-5 h-5 text-gray-500 transition-transform duration-300 group-hover/icon:rotate-90" />
            </div>
          </a>
        </nav>
      </div>

      <div className="bg-[#29A177] px-6 py-6 text-white h-1/6">
        <div className="flex items-center gap-4">
          <div className="h-11 w-11 rounded-full bg-white" />
          <div>
            <p className="text-base opacity-90 leading-tight">User Account</p>
            <h2 className="text-xl font-semibold leading-tight">Kristoffer Neo Senyahan</h2>
          </div>
        </div>
      </div>
    </aside>
  );
}