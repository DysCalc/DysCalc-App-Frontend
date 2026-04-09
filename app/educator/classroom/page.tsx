import ClassCard from "@/components/educator/ClassCard";


export default function EducatorClassroom() {
  return (
    <div className="flex h-full w-full flex-col items-center">
        <div className="flex h-full w-full flex-2 bg-neutral-50 justify-end items-center pt-15 border-b border-[#D9D9D9]">

            <div className="flex flex-col flex-1 items-start bg-neutral-50 px-15 gap-0">
                <div className="text-neutral-600 text-5xl font-semibold">
                Juan Dela Cruz
                </div>

                <div className="flex-1 text-neutral-600 text-lg font-light">
                Special Education Teacher / Adviser
                </div>
            </div>

            <div className="flex flex-col flex-1 align-center items-end bg-neutral-10 px-15">
                <button className="inline-flex items-center justify-center rounded-md bg-[#29A177] px-15 py-3 text-lg font-medium text-white shadow-sm transition duration-200 hover:bg-[#018255] hover:shadow-md active:scale-95">
                Create a Class
                </button>
            </div>
        </div>


        <div className="flex w-full h-full flex-5 gap-3">
            <div className="grid w-full h-full grid-cols-3 grid-rows-2 gap-5 p-15 pb-55">
                <ClassCard title="2023 SpEd Iligan City" students={8} variant="yellow"/>
                <ClassCard title="Class 2" students={12} variant="green"/>
                <ClassCard title="Class 3" students={10} variant="blue"/>
                <ClassCard title="Class 4" students={15} variant="green"/>
                <ClassCard title="Class 5" students={8} variant="yellow"/>
                <ClassCard variant="empty" />
            </div>
        </div>
    </div>
  );
}
