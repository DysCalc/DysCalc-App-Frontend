"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/auth-provider";
import { formatProfile, getUserProfile, updateUserProfile, deleteUserProfile } from "@/hooks/use-profile";
import { toast } from "sonner";
import AlertModal from "@/components/shared/AlertModal";

function getHighQualityGoogleAvatar(url: string | null) {
  if (!url) return null;
  return url
    .replace(/=s\d+-c$/, "=s512-c")
    .replace(/=s\d+$/, "=s512")
    .replace(/=w\d+-h\d+-p$/, "=s512-c");
}

export default function AdminProfilePage() {
  const router = useRouter();
  const params = useParams<{ adminID: string }>();
  const { adminID } = params;
  const { user, profile: authProfile, loading, logout } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [nickname, setNickname] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [sex, setSex] = useState<"MALE" | "FEMALE">("MALE");

  useEffect(() => {
    let mounted = true;
    async function fetchProfile() {
      if (!user) return;
      const data = await getUserProfile(adminID);
      if (mounted && data) {
        setNickname(data.nickname || "");
        setDateOfBirth(data.date_of_birth ? data.date_of_birth.split('T')[0] : "");
        setSex((data.sex as "MALE" | "FEMALE") || "MALE");
      }
      setIsLoading(false);
    }

    if (!loading) fetchProfile();
    return () => { mounted = false; };
  }, [user, loading, adminID]);

  if (loading || isLoading) {
    return (
      <main className="h-full w-full bg-[#F7F7F7]">
        <section className="flex h-full w-full items-center justify-center bg-neutral-800">
          <p className="text-2xl font-bold text-white">Loading profile...</p>
        </section>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="h-full w-full bg-[#F7F7F7]">
        <section className="flex h-full w-full items-center justify-center bg-neutral-800">
          <p className="text-2xl font-bold text-white">No user found.</p>
        </section>
      </main>
    );
  }

  const { name, avatar_url } = formatProfile(user, authProfile);
  const highQualityAvatarUrl = getHighQualityGoogleAvatar(avatar_url || null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const result = await updateUserProfile(adminID, {
      nickname,
      date_of_birth: dateOfBirth,
      sex
    });
    if (result.success) {
      toast.success("Profile updated successfully!");
    } else {
      toast.error(result.error || "Failed to update profile");
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteUserProfile(adminID);
    if (result.success) {
      toast.success("Account deleted permanently.");
      logout();
      router.push("/login");
    } else {
      toast.error(result.error || "Failed to delete account");
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <main className="h-full w-full overflow-y-auto bg-[#F7F7F7]">
      <section className="flex min-h-[40vh] w-full flex-col overflow-hidden bg-neutral-800 px-6 py-10">
        <div className="shrink-0">
          <Link
            href={`/admin/${adminID}/dashboard`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-white transition-colors duration-300 hover:text-neutral-300"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </Link>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center z-10">
          <div className="relative flex h-[200px] w-[200px] items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow-xl">
            {highQualityAvatarUrl ? (
              <Image
                src={highQualityAvatarUrl}
                alt={name}
                width={200}
                height={200}
                className="h-full w-full object-cover"
              />
            ) : (
              <Image
                src="/icons/main-icon.svg"
                alt="DysCalc Avatar"
                width={120}
                height={120}
                className="h-auto w-[120px] object-contain"
              />
            )}
          </div>

          <div className="mt-6 text-center">
            <h1 className="text-4xl font-extrabold text-white">{name}</h1>
            <p className="mt-2 text-xl font-semibold text-white/90">Administrator</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-12">
        <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-neutral-800">Profile Information</h2>
          <p className="mb-6 text-sm text-neutral-500">Update your public profile details.</p>

          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">Nickname</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full rounded-md border border-neutral-300 px-4 py-2 text-neutral-700 outline-none focus:border-[#29A177] focus:ring-1 focus:ring-[#29A177]"
                placeholder="How should we call you?"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">Date of Birth</label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
                className="w-full rounded-md border border-neutral-300 px-4 py-2 text-neutral-700 outline-none focus:border-[#29A177] focus:ring-1 focus:ring-[#29A177]"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">Sex</label>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value as any)}
                required
                className="w-full rounded-md border border-neutral-300 px-4 py-2 text-neutral-700 outline-none focus:border-[#29A177] focus:ring-1 focus:ring-[#29A177]"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-md bg-neutral-800 px-6 py-2.5 font-medium text-white transition-colors hover:bg-neutral-700 disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 rounded-xl border border-red-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold text-red-600">Danger Zone</h2>
          <p className="mt-2 text-sm text-neutral-500">
            Permanently delete your account. This action cannot be undone.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowDeleteModal(true)}
              className="rounded-md border border-red-200 bg-red-50 px-6 py-2.5 font-medium text-red-600 transition-colors hover:bg-red-100"
            >
              Delete Account
            </button>
          </div>
        </div>
      </section>

      {showDeleteModal && (
        <AlertModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Account"
          description="Are you absolutely sure you want to permanently delete your account? You will not be able to log back in."
          primaryAction={{
            label: isDeleting ? "Deleting..." : "Yes, Delete Account",
            onClick: handleDelete,
            variant: "danger",
            disabled: isDeleting
          }}
          secondaryAction={{
            label: "Cancel",
            onClick: () => setShowDeleteModal(false),
            disabled: isDeleting
          }}
        />
      )}
    </main>
  );
}
