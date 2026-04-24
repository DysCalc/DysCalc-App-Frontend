import { ApiResult } from "@/hooks/utils";
import { useState } from "react";
import { toast } from "sonner";
import { type Classroom, type ClassroomWithStudentCount } from "@/types";

interface CreateClassModalProps {
    educatorId: string | null;
    closeCreateModal: () => void;
    classrooms: ClassroomWithStudentCount[];
    setClassrooms: (classrooms: ClassroomWithStudentCount[]) => void;
    createClassroom: (educatorId: string, classroomName: string) => Promise<ApiResult<Classroom>>;
}

export default function CreateClassModal({
    educatorId,
    closeCreateModal,
    createClassroom,
    classrooms,
    setClassrooms
}: CreateClassModalProps) {
    const [classroomName, setClassroomName] = useState("");
    const handleCreateClass = async () => {
        if (!educatorId) {
            toast.error("Educator ID is required");
            return;
        }
        if (!classroomName.trim()) {
            toast.error("Classroom name is required");
            return;
        }
        if (classrooms.some((classroom) => classroom.name === classroomName)) {
            toast.error("Classroom name already exists");
            return;
        }
        const result = await createClassroom(educatorId, classroomName);
        if (result.success) {
            toast.success("Classroom created successfully");
            closeCreateModal();
            setClassrooms([{ ...result.data, student_count: 0 }, ...classrooms]);
        } else {
            console.log(result.error);
            toast.error("Failed to create classroom");
        }
    }
    return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
        <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5">
                <h2 className="text-3xl font-semibold text-[#6C6C6C]">
                    Create Classroom
                </h2>
                <p className="mt-1 text-base text-neutral-500">
                    Enter a classroom name.
                </p>
            </div>

            <div className="flex flex-col gap-2">
                <label
                    htmlFor="classroom-name"
                    className="text-sm font-medium text-[#6C6C6C]"
                >
                    Name
                </label>

                <input
                    id="classroom-name"
                    type="text"
                    value={classroomName}
                    onChange={(e) => setClassroomName(e.target.value)}
                    placeholder="Enter classroom name"
                    className="rounded-lg border border-[#D9D9D9] px-4 py-3 text-base text-[#6C6C6C] outline-none transition focus:border-[#29A177] focus:ring-2 focus:ring-[#29A177]/20"
                    autoFocus
                />
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
                <button
                    onClick={closeCreateModal}
                    className="rounded-lg border border-[#D9D9D9] px-4 py-2 text-sm font-medium text-[#6C6C6C] transition hover:bg-neutral-50"
                >
                    Cancel
                </button>

                <button
                    onClick={handleCreateClass}
                    className="rounded-lg bg-[#29A177] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#018255] disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!classroomName.trim()}
                >
                    Create
                </button>
            </div>
        </div>
    </div>
}