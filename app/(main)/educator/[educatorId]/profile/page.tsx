"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/auth-provider";
import { formatProfile, getUserProfile, updateUserProfile, deleteUserProfile } from "@/hooks/use-profile";
import { createEducatorsAPI } from "@/hooks/use-educators";
import { toast } from "sonner";
import AlertModal from "@/components/shared/AlertModal";

function getHighQualityGoogleAvatar(url: string | null) {
  if (!url) return null;
  return url
    .replace(/=s\d+-c$/, "=s512-c")
    .replace(/=s\d+$/, "=s512")
    .replace(/=w\d+-h\d+-p$/, "=s512-c");
}

const educatorsAPI = createEducatorsAPI();

export default function EducatorProfilePage() {
  const router = useRouter();
  const params = useParams<{ educatorId: string }>();
  const { educatorId } = params;
  const { user, profile: authProfile, loading, logout } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Profile State
  const [nickname, setNickname] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [sex, setSex] = useState<"MALE" | "FEMALE">("MALE");

  // Educator State
  const [licenseId, setLicenseId] = useState("");
  const [workplaceName, setWorkplaceName] = useState("");
  const [workplaceAddress, setWorkplaceAddress] = useState("");

  const [undergradDegree, setUndergradDegree] = useState("");
  const [undergradSchool, setUndergradSchool] = useState("");
  const [undergradYear, setUndergradYear] = useState("");

  const [mastersDegree, setMastersDegree] = useState("");
  const [mastersSchool, setMastersSchool] = useState("");
  const [mastersYear, setMastersYear] = useState("");

  const [doctorateDegree, setDoctorateDegree] = useState("");
  const [doctorateSchool, setDoctorateSchool] = useState("");
  const [doctorateYear, setDoctorateYear] = useState("");

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      if (!user) return;

      const [profileData, educatorRes] = await Promise.all([
        getUserProfile(educatorId),
        educatorsAPI.fetchEducatorById(educatorId)
      ]);

      if (mounted && profileData) {
        setNickname(profileData.nickname || "");
        setDateOfBirth(profileData.date_of_birth ? profileData.date_of_birth.split('T')[0] : "");
        setSex((profileData.sex as "MALE" | "FEMALE") || "MALE");
      }

      if (mounted && educatorRes.success && educatorRes.data) {
        const ed = educatorRes.data as any; // Using any for flexible mapping from DB row
        setLicenseId(ed.license_id || "");
        setWorkplaceName(ed.workplace_name || "");
        setWorkplaceAddress(ed.workplace_address || "");

        if (ed.undergrad) {
          setUndergradDegree(ed.undergrad.degree || "");
          setUndergradSchool(ed.undergrad.school || "");
          setUndergradYear(ed.undergrad.year || "");
        }
        if (ed.masters) {
          setMastersDegree(ed.masters.degree || "");
          setMastersSchool(ed.masters.school || "");
          setMastersYear(ed.masters.year || "");
        }
        if (ed.doctorate) {
          setDoctorateDegree(ed.doctorate.degree || "");
          setDoctorateSchool(ed.doctorate.school || "");
          setDoctorateYear(ed.doctorate.year || "");
        }
      }
      setIsLoading(false);
    }

    if (!loading) fetchData();
    return () => { mounted = false; };
  }, [user, loading, educatorId]);

  if (loading || isLoading) {
    return (
      <main className="h-full w-full bg-[#F7F7F7]">
        <section className="flex h-full w-full items-center justify-center bg-[#29A177]">
          <p className="text-2xl font-bold text-white">Loading profile...</p>
        </section>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="h-full w-full bg-[#F7F7F7]">
        <section className="flex h-full w-full items-center justify-center bg-[#29A177]">
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

    // Save Profile
    const profileResult = await updateUserProfile(educatorId, {
      nickname,
      date_of_birth: dateOfBirth,
      sex
    });

    // Save Educator Data
    const educatorResult = await educatorsAPI.updateEducatorProfile(educatorId, {
      license_id: licenseId,
      workplace_name: workplaceName,
      workplace_address: workplaceAddress,
      undergrad: undergradDegree ? { degree: undergradDegree, school: undergradSchool, year: undergradYear } : null,
      masters: mastersDegree ? { degree: mastersDegree, school: mastersSchool, year: mastersYear } : null,
      doctorate: doctorateDegree ? { degree: doctorateDegree, school: doctorateSchool, year: doctorateYear } : null
    });

    if (profileResult.success || educatorResult.success) {
      toast.success("Profile updated successfully!");
    } else {
      toast.error(profileResult.error || educatorResult.error || "Failed to update profile");
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteUserProfile(educatorId);
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
      <section className="flex min-h-[40vh] w-full flex-col overflow-hidden bg-[#29A177] px-6 py-10">
        <div className="shrink-0">
          <Link
            href={`/educator/${educatorId}/dashboard`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-white transition-colors duration-300 hover:text-[#DED84E]"
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
            <p className="mt-2 text-xl font-semibold text-white/90">Educator</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-12">
        <form onSubmit={handleSave} className="space-y-8">

          {/* General Profile Info */}
          <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-neutral-800">Basic Information</h2>
            <p className="mb-6 text-sm text-neutral-500">Update your public profile details.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>
          </div>

          {/* Professional Information */}
          <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-neutral-800">Professional Information</h2>
            <p className="mb-6 text-sm text-neutral-500">Update your licensing and workplace details.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">License ID</label>
                <input
                  type="text"
                  value={licenseId}
                  onChange={(e) => setLicenseId(e.target.value)}
                  className="w-full rounded-md border border-neutral-300 px-4 py-2 text-neutral-700 outline-none focus:border-[#29A177] focus:ring-1 focus:ring-[#29A177]"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">Workplace Name</label>
                <input
                  type="text"
                  value={workplaceName}
                  onChange={(e) => setWorkplaceName(e.target.value)}
                  className="w-full rounded-md border border-neutral-300 px-4 py-2 text-neutral-700 outline-none focus:border-[#29A177] focus:ring-1 focus:ring-[#29A177]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-neutral-700">Workplace Address</label>
                <input
                  type="text"
                  value={workplaceAddress}
                  onChange={(e) => setWorkplaceAddress(e.target.value)}
                  className="w-full rounded-md border border-neutral-300 px-4 py-2 text-neutral-700 outline-none focus:border-[#29A177] focus:ring-1 focus:ring-[#29A177]"
                />
              </div>
            </div>
          </div>

          {/* Educational Background */}
          <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-neutral-800">Educational Background</h2>
            <p className="mb-6 text-sm text-neutral-500">Update your degrees and educational history.</p>

            <div className="space-y-6">
              {/* Undergrad */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-neutral-100 pb-6">
                <div>
                  <label className="mb-2 block text-xs font-medium text-neutral-500 uppercase tracking-wider">Undergraduate Degree</label>
                  <input
                    type="text"
                    value={undergradDegree}
                    onChange={(e) => setUndergradDegree(e.target.value)}
                    className="w-full rounded-md border border-neutral-300 px-4 py-2 text-sm text-neutral-700 outline-none focus:border-[#29A177] focus:ring-1 focus:ring-[#29A177]"
                    placeholder="e.g. BS Psychology"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium text-neutral-500 uppercase tracking-wider">Institution</label>
                  <input
                    type="text"
                    value={undergradSchool}
                    onChange={(e) => setUndergradSchool(e.target.value)}
                    className="w-full rounded-md border border-neutral-300 px-4 py-2 text-sm text-neutral-700 outline-none focus:border-[#29A177] focus:ring-1 focus:ring-[#29A177]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium text-neutral-500 uppercase tracking-wider">Year</label>
                  <input
                    type="text"
                    value={undergradYear}
                    onChange={(e) => setUndergradYear(e.target.value)}
                    className="w-full rounded-md border border-neutral-300 px-4 py-2 text-sm text-neutral-700 outline-none focus:border-[#29A177] focus:ring-1 focus:ring-[#29A177]"
                  />
                </div>
              </div>

              {/* Masters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-neutral-100 pb-6">
                <div>
                  <label className="mb-2 block text-xs font-medium text-neutral-500 uppercase tracking-wider">Master's Degree</label>
                  <input
                    type="text"
                    value={mastersDegree}
                    onChange={(e) => setMastersDegree(e.target.value)}
                    className="w-full rounded-md border border-neutral-300 px-4 py-2 text-sm text-neutral-700 outline-none focus:border-[#29A177] focus:ring-1 focus:ring-[#29A177]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium text-neutral-500 uppercase tracking-wider">Institution</label>
                  <input
                    type="text"
                    value={mastersSchool}
                    onChange={(e) => setMastersSchool(e.target.value)}
                    className="w-full rounded-md border border-neutral-300 px-4 py-2 text-sm text-neutral-700 outline-none focus:border-[#29A177] focus:ring-1 focus:ring-[#29A177]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium text-neutral-500 uppercase tracking-wider">Year</label>
                  <input
                    type="text"
                    value={mastersYear}
                    onChange={(e) => setMastersYear(e.target.value)}
                    className="w-full rounded-md border border-neutral-300 px-4 py-2 text-sm text-neutral-700 outline-none focus:border-[#29A177] focus:ring-1 focus:ring-[#29A177]"
                  />
                </div>
              </div>

              {/* Doctorate */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="mb-2 block text-xs font-medium text-neutral-500 uppercase tracking-wider">Doctorate</label>
                  <input
                    type="text"
                    value={doctorateDegree}
                    onChange={(e) => setDoctorateDegree(e.target.value)}
                    className="w-full rounded-md border border-neutral-300 px-4 py-2 text-sm text-neutral-700 outline-none focus:border-[#29A177] focus:ring-1 focus:ring-[#29A177]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium text-neutral-500 uppercase tracking-wider">Institution</label>
                  <input
                    type="text"
                    value={doctorateSchool}
                    onChange={(e) => setDoctorateSchool(e.target.value)}
                    className="w-full rounded-md border border-neutral-300 px-4 py-2 text-sm text-neutral-700 outline-none focus:border-[#29A177] focus:ring-1 focus:ring-[#29A177]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium text-neutral-500 uppercase tracking-wider">Year</label>
                  <input
                    type="text"
                    value={doctorateYear}
                    onChange={(e) => setDoctorateYear(e.target.value)}
                    className="w-full rounded-md border border-neutral-300 px-4 py-2 text-sm text-neutral-700 outline-none focus:border-[#29A177] focus:ring-1 focus:ring-[#29A177]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-8">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-md bg-[#29A177] px-8 py-3 font-medium text-white transition-colors hover:bg-[#238B67] disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save All Changes"}
              </button>
            </div>
          </div>
        </form>

        <div className="mt-8 rounded-xl border border-red-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold text-red-600">Danger Zone</h2>
          <p className="mt-2 text-sm text-neutral-500">
            Permanently delete your account. This action cannot be undone.
            However, your anonymous classroom data will be retained for algorithm improvements.
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
