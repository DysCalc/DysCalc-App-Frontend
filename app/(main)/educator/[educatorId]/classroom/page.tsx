"use client";

import { useState, useEffect } from "react";
import ClassCard from "@/components/educator/ClassCard";
import CreateClassModal from "@/components/educator/CreateClassModal";
import { type ClassroomWithStudentCount } from "@/types";
import { createClassroomAPI } from "@/hooks/use-classroom";
import { createClient } from "@/lib/supabase-client";
import { useAuth } from "@/contexts/auth-provider";
import { toast } from "sonner";
import { ApiResult } from "@/hooks/utils";
import AlertModal from "@/components/shared/AlertModal";
import { useRouter } from "next/navigation";
import { type Classroom } from "@/types";

const CLASSROOM_COLORS = ["green", "blue", "yellow", "gray"] as const;

export default function EducatorClassroom() {
  const router = useRouter();
  const { user } = useAuth();
  const [classrooms, setClassrooms] = useState<ClassroomWithStudentCount[]>([]);
  const [showModal, setShowModal] = useState(false);

  // Operations
  const [isLoading, setIsLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState<ClassroomWithStudentCount | null>(null);
  const [editName, setEditName] = useState("");

  const supabase = createClient();
  const { getAllClassrooms, createClassroom, deleteClassroom, updateClassroomName } = createClassroomAPI(supabase);

  if (!user) return;
  useEffect(() => {
    async function getClassrooms(educator_id: Classroom['educator_id']) {
      const classroomResult: ApiResult<ClassroomWithStudentCount[]> = await getAllClassrooms(educator_id);
      if (!classroomResult.success) {
        console.log(classroomResult.error);
        toast.error("Failed to fetch classrooms");
        return;
      }
      setClassrooms(classroomResult.data);
    }

    getClassrooms(user.id);
  }, [user]);

  const handleClassCardClick = (classroomId: Classroom['id']) => {
    router.push(`/educator/${user?.id}/${classroomId}`);
  };
  ``
  const openCreateModal = () => {
    setShowModal(true);
  };

  const closeCreateModal = () => {
    setShowModal(false);
  };

  const openEditModal = (classroom: ClassroomWithStudentCount) => {
    setSelectedClassroom(classroom);
    setEditName(classroom.name);
    setShowEditModal(true);
  };

  const openDeleteModal = (classroom: ClassroomWithStudentCount) => {
    setSelectedClassroom(classroom);
    setShowDeleteModal(true);
  };

  const handleEditClassroom = async () => {
    if (!selectedClassroom) return;
    if (!editName.trim()) {
      toast.error("Classroom name is required");
      return;
    }

    setIsLoading(true);
    const res = await updateClassroomName(selectedClassroom.id, editName);
    setIsLoading(false);

    if (res.success) {
      toast.success("Classroom name updated successfully");
      setClassrooms(prev => prev.map(c => c.id === selectedClassroom.id ? { ...c, name: editName } : c));
      setShowEditModal(false);
      setSelectedClassroom(null);
    } else {
      toast.error("Failed to update classroom name");
    }
  };

  const handleDeleteClassroom = async () => {
    if (!selectedClassroom) return;

    setIsLoading(true);
    const res = await deleteClassroom(selectedClassroom.id);
    setIsLoading(false);

    if (res.success) {
      toast.success("Classroom deleted successfully");
      setClassrooms(prev => prev.filter(c => c.id !== selectedClassroom.id));
      setShowDeleteModal(false);
      setSelectedClassroom(null);
    } else {
      toast.error("Failed to delete classroom");
    }
  };

  return (
    <div className="flex h-full w-full flex-col items-center">
      <div className="flex h-full w-full flex-2 items-center justify-end border-b border-[#D9D9D9] bg-neutral-50 pt-15">
        <div className="flex flex-1 flex-col items-start gap-0 bg-neutral-50 px-15">
          <div className="text-5xl font-semibold text-neutral-600">
            {user.user_metadata.full_name}
          </div>

          <div className="flex-1 text-lg font-light text-neutral-600">
            Special Education Teacher / Adviser
          </div>
        </div>

        <div className="flex flex-1 flex-col items-end bg-neutral-10 px-15">
          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center rounded-md bg-[#29A177] px-15 py-3 text-lg font-medium text-white shadow-sm transition duration-200 hover:bg-[#018255] hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Create a Class
          </button>
        </div>
      </div>

      <div className="flex h-full w-full flex-5 gap-3">
        <div className="grid h-full w-full grid-cols-3 grid-rows-2 gap-5 p-15 pb-55">
          {classrooms.map((cls, index) => (
            <ClassCard
              key={cls.id}
              id={cls.id}
              name={cls.name}
              student_count={cls.student_count}
              variant={CLASSROOM_COLORS[index % CLASSROOM_COLORS.length]}
              onEdit={() => openEditModal(cls)}
              onDelete={() => openDeleteModal(cls)}
              onCardClick={handleClassCardClick}
            />
          ))}
        </div>
      </div>

      {showModal && (
        <CreateClassModal
          educatorId={user?.id}
          closeCreateModal={closeCreateModal}
          createClassroom={createClassroom}
          classrooms={classrooms}
          setClassrooms={setClassrooms}
        />
      )}

      {selectedClassroom && (
        <>
          <AlertModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            title="Delete Classroom"
            description={`Are you sure you want to delete ${selectedClassroom.name}?`}
            primaryAction={{
              label: isLoading ? "Deleting..." : "Delete",
              onClick: handleDeleteClassroom,
              variant: "danger",
              disabled: isLoading,
            }}
            secondaryAction={{
              label: "Cancel",
              onClick: () => setShowDeleteModal(false),
              disabled: isLoading,
            }}
          />

          <AlertModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            title="Edit Classroom"
            description="Update the name of your classroom."
            primaryAction={{
              label: isLoading ? "Saving..." : "Save Changes",
              onClick: handleEditClassroom,
              disabled: !editName.trim() || isLoading,
            }}
            secondaryAction={{
              label: "Cancel",
              onClick: () => setShowEditModal(false),
              disabled: isLoading,
            }}
            maxWidth="lg"
          >
            <div className="flex flex-col gap-2">
              <label
                htmlFor="edit-classroom"
                className="text-sm font-medium text-[#6C6C6C]"
              >
                Name
              </label>
              <input
                id="edit-classroom"
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter classroom name"
                className="rounded-lg border border-[#D9D9D9] px-4 py-3 text-base text-[#6C6C6C] outline-none transition focus:border-[#29A177] focus:ring-2 focus:ring-[#29A177]/20"
                autoFocus
                disabled={isLoading}
              />
            </div>
          </AlertModal>
        </>
      )}
    </div>
  );
}