"use client";

import { createClient } from "@/lib/supabase-client";
import { createStudentAPI } from "@/hooks/use-students";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-provider";
import { type Role, type Sex, type Profile, type EducatorEducation, RoleEnum, SexEnum } from "@/types";
import { toast } from "sonner";

import { SparklesIcon, IdentificationIcon, UserIcon, ArrowRightIcon, AcademicCapIcon, MapPinIcon } from "@heroicons/react/24/outline";

const YEAR_RANGE_REGEX = /^[0-9]{4}-[0-9]{4}$/;

export default function Setup() {
  const [setupPhase, setSetupPhase] = useState<1 | 2>(1);
  const [role, setRole] = useState<Role>(RoleEnum.STUDENT);
  const [dateOfBirth, setDateOfBirth] = useState<string>("");
  const [nickname, setNickname] = useState<string>("");
  const [sex, setSex] = useState<Sex>(SexEnum.MALE);
  const [loading, setLoading] = useState(false);
  const [isRoleLocked, setIsRoleLocked] = useState(false);

  const [licenseId, setLicenseId] = useState<string>("");
  const [workplaceAddress, setWorkplaceAddress] = useState<string>("");
  const [workplaceName, setWorkplaceName] = useState<string>("");
  const [undergrad, setUndergrad] = useState<EducatorEducation>({
    program: "",
    school: "",
    year: "",
  });
  const [masters, setMasters] = useState<EducatorEducation>({
    program: "",
    school: "",
    year: "",
  });
  const [doctorate, setDoctorate] = useState<EducatorEducation>({
    program: "",
    school: "",
    year: "",
  });

  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();
  const { acceptInvite } = createStudentAPI();

  const isEducationBlank = (education: EducatorEducation) =>
    !education.program.trim() && !education.school.trim() && !education.year.trim();

  const toEducationPayload = (
    education: EducatorEducation,
    fieldLabel: string,
    options?: { optional?: boolean }
  ): { program: string; school: string; year: string } | null => {
    const program = education.program.trim();
    const school = education.school.trim();
    const year = education.year.trim();

    if (options?.optional && !program && !school && !year) {
      return null;
    }

    if (!program || !school || !year) {
      throw new Error(`${fieldLabel} must include program, school, and year.`);
    }

    if (!YEAR_RANGE_REGEX.test(year)) {
      throw new Error(`${fieldLabel} year must follow YYYY-YYYY.`);
    }

    return { program, school, year };
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlClassId = params.get("class_id");

    if (urlClassId) {
      setRole(RoleEnum.STUDENT);
      setIsRoleLocked(true);
      return;
    }

    const invitedClassId = user?.user_metadata?.invited_class_id;
    if (invitedClassId) {
      setRole(RoleEnum.STUDENT);
      setIsRoleLocked(true);
      return;
    }

    const forcedRole = params.get("role")?.toUpperCase() as Role;
    if (forcedRole && Object.values(RoleEnum).includes(forcedRole)) {
      setRole(forcedRole);
      setIsRoleLocked(true);
    }
  }, [user]);

  const redirectToDashboard = (nextRole: Role, userId: string) => {
    window.location.replace(`/${nextRole.toLowerCase()}/${userId}/dashboard`);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      router.push("/");
      return;
    }

    if (!dateOfBirth) {
      toast.error("Please provide your Date of Birth.");
      return;
    }

    if (role === RoleEnum.EDUCATOR) {
      // Only transition to Phase 2 for Educators, do not save yet.
      setSetupPhase(2);
      return;
    }

    // For non-educators, save immediately
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.updateUser({
        data: { role },
      });
      if (authError) throw authError;

      const userProfile: Profile = {
        id: user.id,
        created_at: new Date().toISOString(),
        date_of_birth: dateOfBirth,
        sex,
        nickname: nickname || null,
      };

      const { error: profileError } = await supabase
        .from("profiles")
        .upsert(userProfile, { onConflict: "id" });
      if (profileError) throw profileError;

      const params = new URLSearchParams(window.location.search);
      const urlClassId = params.get("class_id");
      const inviteEmail = params.get("invite_email");
      const invitedClassId = urlClassId || user.user_metadata?.invited_class_id;
      if (invitedClassId && role === RoleEnum.STUDENT) {
        const result = await acceptInvite(String(invitedClassId), inviteEmail || user.email || undefined);
        if (!result.success) {
          console.error("Failed to link student to class:", result.error);
        }
      }

      await supabase.auth.getSession();
      redirectToDashboard(role, user.id);
    } catch (error: any) {
      toast.error(error.message || "Failed to complete setup");
      setLoading(false);
    }
  };

  const handleEducatorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user) {
        router.push("/");
        return;
      }

      const trimmedAddress = workplaceAddress.trim();
      if (!trimmedAddress) throw new Error("Workplace address is required.");

      const trimmedLicenseId = licenseId.trim();
      if (!trimmedLicenseId) throw new Error("License ID is required.");

      const undergradPayload = toEducationPayload(undergrad, "Undergraduate education");
      const mastersPayload = toEducationPayload(masters, "Master's education", { optional: true });
      const doctoratePayload = toEducationPayload(doctorate, "Doctorate education", { optional: true });

      // Save auth, profile, and educator data simultaneously to prevent partial states
      const { error: authError } = await supabase.auth.updateUser({
        data: { role },
      });
      if (authError) throw authError;

      const userProfile: Profile = {
        id: user.id,
        created_at: new Date().toISOString(),
        date_of_birth: dateOfBirth,
        sex,
        nickname: nickname || null,
      };
      
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert(userProfile, { onConflict: "id" });
      if (profileError) throw profileError;

      const { error: educatorError } = await supabase.from("educator").upsert(
        {
          id: user.id,
          license_id: trimmedLicenseId,
          undergrad: undergradPayload,
          masters: mastersPayload,
          doctorate: doctoratePayload,
          workplace_address: trimmedAddress,
          workplace_name: workplaceName.trim() || null,
        },
        { onConflict: "id" }
      );
      if (educatorError) throw educatorError;

      await supabase.auth.getSession();
      redirectToDashboard(RoleEnum.EDUCATOR, user.id);
    } catch (error: any) {
      toast.error(error.message || "Failed to complete educator setup");
      setLoading(false);
    }
  };

  const isOptionalMastersBlank = isEducationBlank(masters);
  const isOptionalDoctorateBlank = isEducationBlank(doctorate);

  const inputClasses = "w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-[#29A177] focus:outline-none focus:ring-1 focus:ring-[#29A177] transition-colors";
  const labelClasses = "block text-sm font-bold text-zinc-700 mb-1.5";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F7F7] px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-8 bg-white p-10 rounded-2xl shadow-sm border border-zinc-200 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-[#ECF9F4] blur-3xl pointer-events-none opacity-60"></div>
        <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-blue-50 blur-3xl pointer-events-none opacity-60"></div>

        <div className="text-center relative z-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#ECF9F4] mb-4">
            <SparklesIcon className="h-7 w-7 text-[#29A177]" />
          </div>
          <h2 className="text-3xl font-extrabold text-[#5C5E64]">
            Complete Your Profile
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            {setupPhase === 1 
              ? "Tell us a bit about yourself to personalize your experience." 
              : "We need a few more details to set up your educator account."}
          </p>

          <div className="mt-6 flex items-center justify-center space-x-4">
            <div className={`h-1.5 w-16 rounded-full transition-colors ${setupPhase === 1 ? "bg-[#29A177]" : "bg-[#29A177]"}`}></div>
            <div className={`h-1.5 w-16 rounded-full transition-colors ${setupPhase === 2 ? "bg-[#29A177]" : "bg-zinc-200"}`}></div>
          </div>
        </div>

        <form
          onSubmit={setupPhase === 1 ? handleProfileSubmit : handleEducatorSubmit}
          className="space-y-6 relative z-10"
        >
          {setupPhase === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Role */}
              <div>
                <label className={labelClasses}>Account Role</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <UserIcon className="h-4 w-4 text-zinc-400" />
                  </div>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    disabled={isRoleLocked}
                    className={`${inputClasses} pl-10 ${isRoleLocked ? "bg-zinc-50 text-zinc-500 cursor-not-allowed" : ""}`}
                  >
                    <option value={RoleEnum.STUDENT}>Student</option>
                    <option value={RoleEnum.EDUCATOR}>Educator</option>
                    <option value={RoleEnum.ADMIN}>Admin</option>
                  </select>
                </div>
              </div>

              {/* Nickname */}
              <div>
                <label className={labelClasses}>Preferred Nickname</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className={inputClasses}
                  placeholder="How should we call you?"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Date of Birth */}
                <div>
                  <label className={labelClasses}>Date of Birth</label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className={inputClasses}
                    required
                  />
                </div>

                {/* Sex */}
                <div>
                  <label className={labelClasses}>Sex</label>
                  <select
                    value={sex}
                    onChange={(e) => setSex(e.target.value as Sex)}
                    className={inputClasses}
                  >
                    <option value={SexEnum.MALE}>Male</option>
                    <option value={SexEnum.FEMALE}>Female</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {setupPhase === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              
              <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 space-y-4">
                <h4 className="text-sm font-extrabold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                  <IdentificationIcon className="h-4 w-4" />
                  Professional Details
                </h4>
                
                <div>
                  <label className={labelClasses}>PRC / License ID</label>
                  <input
                    type="text"
                    value={licenseId}
                    onChange={(e) => setLicenseId(e.target.value)}
                    className={inputClasses}
                    placeholder="e.g. 1234567"
                    required
                  />
                </div>

                <div>
                  <label className={labelClasses}>Workplace Name (Optional)</label>
                  <input
                    type="text"
                    value={workplaceName}
                    onChange={(e) => setWorkplaceName(e.target.value)}
                    className={inputClasses}
                    placeholder="Where do you teach?"
                  />
                </div>

                <div>
                  <label className={labelClasses}>Workplace Address</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <MapPinIcon className="h-4 w-4 text-zinc-400" />
                    </div>
                    <input
                      type="text"
                      value={workplaceAddress}
                      onChange={(e) => setWorkplaceAddress(e.target.value)}
                      className={`${inputClasses} pl-10`}
                      placeholder="School or Clinic address"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 space-y-5">
                <h4 className="text-sm font-extrabold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                  <AcademicCapIcon className="h-4 w-4" />
                  Educational Background
                </h4>

                <div className="space-y-3">
                  <p className="text-sm font-bold text-[#29A177]">Undergraduate Education</p>
                  <input
                    type="text"
                    placeholder="Degree / Program"
                    value={undergrad.program}
                    onChange={(e) => setUndergrad((prev) => ({ ...prev, program: e.target.value }))}
                    className={inputClasses}
                    required
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <input
                        type="text"
                        placeholder="School/University"
                        value={undergrad.school}
                        onChange={(e) => setUndergrad((prev) => ({ ...prev, school: e.target.value }))}
                        className={inputClasses}
                        required
                      />
                    </div>
                    <div className="col-span-1">
                      <input
                        type="text"
                        placeholder="YYYY-YYYY"
                        value={undergrad.year}
                        onChange={(e) => setUndergrad((prev) => ({ ...prev, year: e.target.value }))}
                        className={inputClasses}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-200 space-y-3">
                  <p className="text-sm font-bold text-zinc-700">Master's Education <span className="font-normal text-zinc-500">(Optional)</span></p>
                  <input
                    type="text"
                    placeholder="Degree / Program"
                    value={masters.program}
                    onChange={(e) => setMasters((prev) => ({ ...prev, program: e.target.value }))}
                    className={inputClasses}
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <input
                        type="text"
                        placeholder="School/University"
                        value={masters.school}
                        onChange={(e) => setMasters((prev) => ({ ...prev, school: e.target.value }))}
                        className={inputClasses}
                      />
                    </div>
                    <div className="col-span-1">
                      <input
                        type="text"
                        placeholder="YYYY-YYYY"
                        value={masters.year}
                        onChange={(e) => setMasters((prev) => ({ ...prev, year: e.target.value }))}
                        className={inputClasses}
                      />
                    </div>
                  </div>
                  {!isOptionalMastersBlank && (
                    <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-100">
                      Please fill all three master's fields when providing this section.
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-zinc-200 space-y-3">
                  <p className="text-sm font-bold text-zinc-700">Doctorate Education <span className="font-normal text-zinc-500">(Optional)</span></p>
                  <input
                    type="text"
                    placeholder="Degree / Program"
                    value={doctorate.program}
                    onChange={(e) => setDoctorate((prev) => ({ ...prev, program: e.target.value }))}
                    className={inputClasses}
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <input
                        type="text"
                        placeholder="School/University"
                        value={doctorate.school}
                        onChange={(e) => setDoctorate((prev) => ({ ...prev, school: e.target.value }))}
                        className={inputClasses}
                      />
                    </div>
                    <div className="col-span-1">
                      <input
                        type="text"
                        placeholder="YYYY-YYYY"
                        value={doctorate.year}
                        onChange={(e) => setDoctorate((prev) => ({ ...prev, year: e.target.value }))}
                        className={inputClasses}
                      />
                    </div>
                  </div>
                  {!isOptionalDoctorateBlank && (
                    <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-100">
                      Please fill all three doctorate fields when providing this section.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 flex flex-col gap-3">
            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-lg bg-[#29A177] px-4 py-3 font-bold text-white shadow-sm transition hover:bg-[#20825f] disabled:opacity-50"
            >
              {loading ? "Processing..." : setupPhase === 1 && role === RoleEnum.EDUCATOR ? "Continue to Professional Details" : "Finish Setup"}
              {setupPhase === 1 && role === RoleEnum.EDUCATOR && !loading && (
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              )}
            </button>

            {setupPhase === 2 && (
              <button
                type="button"
                onClick={() => setSetupPhase(1)}
                disabled={loading}
                className="w-full rounded-lg bg-white px-4 py-3 font-bold text-zinc-600 border border-zinc-200 transition hover:bg-zinc-50 disabled:opacity-50"
              >
                Back to Basic Profile
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}