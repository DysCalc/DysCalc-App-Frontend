"use client";

import { createClient } from "@/lib/supabase-client";
import { createStudentAPI } from "@/hooks/use-students";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-provider";
import { type Role, type Sex, type Profile, RoleEnum, SexEnum } from "@/types";
import { toast } from "sonner";

type EducationForm = {
  program: string;
  school: string;
  year: string;
};

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
  const [undergrad, setUndergrad] = useState<EducationForm>({
    program: "",
    school: "",
    year: "",
  });
  const [masters, setMasters] = useState<EducationForm>({
    program: "",
    school: "",
    year: "",
  });
  const [doctorate, setDoctorate] = useState<EducationForm>({
    program: "",
    school: "",
    year: "",
  });

  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();
  const { acceptInvite } = createStudentAPI(supabase);

  const isEducationBlank = (education: EducationForm) =>
    !education.program.trim() && !education.school.trim() && !education.year.trim();

  const toEducationPayload = (
    education: EducationForm,
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

    // Check URL params first (New explicit invite flow)
    if (urlClassId) {
      setRole(RoleEnum.STUDENT);
      setIsRoleLocked(true);
      return;
    }

    // Check user metadata (Legacy automated email invite flow)
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
    setLoading(true);

    try {
      if (!user) {
        router.push("/");
        return;
      }

      // 1. Update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { role },
      });

      if (authError) throw authError;

      // 2. Prepare clean profile object
      const userProfile: Profile = {
        id: user.id,
        created_at: new Date().toISOString(),
        date_of_birth: dateOfBirth,
        sex,
        nickname: nickname || null,
      };

      // 3. Upsert with conflict handling
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert(userProfile, { onConflict: "id" });

      if (profileError) throw profileError;

      // 3.5 Process pending invites if they are a student
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

      // 4. Force session sync (IMPORTANT)
      await supabase.auth.getSession();

      if (role === RoleEnum.EDUCATOR) {
        setSetupPhase(2);
        setLoading(false);
        return;
      }

      // 5. Hard redirect (prevents middleware loop)
      redirectToDashboard(role, user.id);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === "string"
            ? error
            : JSON.stringify(error);

      toast.error(message || "Failed to complete setup");
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
      if (!trimmedAddress) {
        throw new Error("Workplace address is required.");
      }

      const parsedLicenseId = Number(licenseId);
      if (!licenseId || !Number.isInteger(parsedLicenseId) || parsedLicenseId <= 0) {
        throw new Error("License ID must be a positive whole number.");
      }

      const undergradPayload = toEducationPayload(undergrad, "Undergraduate education");
      const mastersPayload = toEducationPayload(masters, "Master's education", {
        optional: true,
      });
      const doctoratePayload = toEducationPayload(doctorate, "Doctorate education", {
        optional: true,
      });

      const { error } = await supabase.from("educator").upsert(
        {
          id: user.id,
          license_id: parsedLicenseId,
          undergrad: undergradPayload,
          masters: mastersPayload,
          doctorate: doctoratePayload,
          workplace_address: trimmedAddress,
          workplace_name: workplaceName.trim() || null,
        },
        { onConflict: "id" }
      );

      if (error) throw error;

      await supabase.auth.getSession();
      redirectToDashboard(RoleEnum.EDUCATOR, user.id);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === "string"
            ? error
            : JSON.stringify(error);

      toast.error(message || "Failed to complete educator setup");
      setLoading(false);
    }
  };

  const isOptionalMastersBlank = isEducationBlank(masters);
  const isOptionalDoctorateBlank = isEducationBlank(doctorate);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-black">
        <h1 className="text-2xl font-bold mb-2 text-center">Complete Setup</h1>
        <p className="text-sm text-gray-600 mb-6 text-center">
          {setupPhase === 1 ? "Step 1 of 2: Basic profile" : "Step 2 of 2: Educator details"}
        </p>

        <form
          onSubmit={setupPhase === 1 ? handleProfileSubmit : handleEducatorSubmit}
          className="space-y-6"
        >
          {setupPhase === 1 && (
            <>
              {/* Role */}
              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  disabled={isRoleLocked}
                  className={`w-full p-3 border rounded ${isRoleLocked ? "bg-gray-100 cursor-not-allowed opacity-70" : ""}`}
                >
                  <option value={RoleEnum.STUDENT}>Student</option>
                  <option value={RoleEnum.EDUCATOR}>Educator</option>
                  <option value={RoleEnum.ADMIN}>Admin</option>
                </select>
              </div>

              {/* Nickname */}
              <div>
                <label className="block text-sm font-medium mb-2">Nickname</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full p-3 border rounded"
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium mb-2">Date of Birth</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full p-3 border rounded"
                />
              </div>

              {/* Sex */}
              <div>
                <label className="block text-sm font-medium mb-2">Sex</label>
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value as Sex)}
                  className="w-full p-3 border rounded"
                >
                  <option value={SexEnum.MALE}>Male</option>
                  <option value={SexEnum.FEMALE}>Female</option>
                </select>
              </div>
            </>
          )}

          {setupPhase === 2 && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">License ID</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={licenseId}
                  onChange={(e) => setLicenseId(e.target.value)}
                  className="w-full p-3 border rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Workplace Address</label>
                <input
                  type="text"
                  value={workplaceAddress}
                  onChange={(e) => setWorkplaceAddress(e.target.value)}
                  className="w-full p-3 border rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Workplace Name (Optional)</label>
                <input
                  type="text"
                  value={workplaceName}
                  onChange={(e) => setWorkplaceName(e.target.value)}
                  className="w-full p-3 border rounded"
                />
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold">Undergraduate Education</p>
                <input
                  type="text"
                  placeholder="Program"
                  value={undergrad.program}
                  onChange={(e) => setUndergrad((prev) => ({ ...prev, program: e.target.value }))}
                  className="w-full p-3 border rounded"
                  required
                />
                <input
                  type="text"
                  placeholder="School"
                  value={undergrad.school}
                  onChange={(e) => setUndergrad((prev) => ({ ...prev, school: e.target.value }))}
                  className="w-full p-3 border rounded"
                  required
                />
                <input
                  type="text"
                  placeholder="Year range (YYYY-YYYY)"
                  value={undergrad.year}
                  onChange={(e) => setUndergrad((prev) => ({ ...prev, year: e.target.value }))}
                  className="w-full p-3 border rounded"
                  required
                />
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold">Master's Education (Optional)</p>
                <input
                  type="text"
                  placeholder="Program"
                  value={masters.program}
                  onChange={(e) => setMasters((prev) => ({ ...prev, program: e.target.value }))}
                  className="w-full p-3 border rounded"
                />
                <input
                  type="text"
                  placeholder="School"
                  value={masters.school}
                  onChange={(e) => setMasters((prev) => ({ ...prev, school: e.target.value }))}
                  className="w-full p-3 border rounded"
                />
                <input
                  type="text"
                  placeholder="Year range (YYYY-YYYY)"
                  value={masters.year}
                  onChange={(e) => setMasters((prev) => ({ ...prev, year: e.target.value }))}
                  className="w-full p-3 border rounded"
                />
                {!isOptionalMastersBlank && (
                  <p className="text-xs text-gray-500">
                    Fill all three master&apos;s fields when providing this section.
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold">Doctorate Education (Optional)</p>
                <input
                  type="text"
                  placeholder="Program"
                  value={doctorate.program}
                  onChange={(e) => setDoctorate((prev) => ({ ...prev, program: e.target.value }))}
                  className="w-full p-3 border rounded"
                />
                <input
                  type="text"
                  placeholder="School"
                  value={doctorate.school}
                  onChange={(e) => setDoctorate((prev) => ({ ...prev, school: e.target.value }))}
                  className="w-full p-3 border rounded"
                />
                <input
                  type="text"
                  placeholder="Year range (YYYY-YYYY)"
                  value={doctorate.year}
                  onChange={(e) => setDoctorate((prev) => ({ ...prev, year: e.target.value }))}
                  className="w-full p-3 border rounded"
                />
                {!isOptionalDoctorateBlank && (
                  <p className="text-xs text-gray-500">
                    Fill all three doctorate fields when providing this section.
                  </p>
                )}
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded font-medium disabled:opacity-50 hover:bg-blue-700"
          >
            {loading ? "Saving..." : setupPhase === 1 ? "Save and Continue" : "Finish Setup"}
          </button>

          {setupPhase === 2 && (
            <button
              type="button"
              onClick={() => setSetupPhase(1)}
              disabled={loading}
              className="w-full border border-gray-300 p-3 rounded font-medium"
            >
              Back to Basic Profile
            </button>
          )}
        </form>
      </div>
    </div>
  );
}