"use client";

import { createClient } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-provider";
import { type Role, type Sex, type Profile, RoleEnum, SexEnum } from "@/types";
import { toast } from "sonner";

export default function Setup() {
  const [role, setRole] = useState<Role>(RoleEnum.STUDENT);
  const [dateOfBirth, setDateOfBirth] = useState<string>("");
  const [nickname, setNickname] = useState<string>("");
  const [sex, setSex] = useState<Sex>(SexEnum.MALE);
  const [loading, setLoading] = useState(false);
  const [isRoleLocked, setIsRoleLocked] = useState(false);

  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();


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

  const handleSubmit = async (e: React.FormEvent) => {
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
      const invitedClassId = urlClassId || user.user_metadata?.invited_class_id;
      if (invitedClassId && role === RoleEnum.STUDENT) {
        const { error: studentError } = await supabase
          .from("students")
          .upsert({
            id: user.id,
            classroom_id: String(invitedClassId),
            accepted: true,
          }, { onConflict: "id,classroom_id" });

        if (studentError) {
          console.error("Failed to link student to class:", studentError);
        }
      }

      // 4. Force session sync (IMPORTANT)
      await supabase.auth.getSession();

      // 5. Hard redirect (prevents middleware loop)
      window.location.replace(`/${role.toLowerCase()}/${user.id}/dashboard`);
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-black">
        <h1 className="text-2xl font-bold mb-6 text-center">Complete Setup</h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Role */}
          <div>
            <label className="block text-sm font-medium mb-2">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              disabled={isRoleLocked}
              className={`w-full p-3 border rounded ${isRoleLocked ? 'bg-gray-100 cursor-not-allowed opacity-70' : ''}`}
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded font-medium disabled:opacity-50 hover:bg-blue-700"
          >
            {loading ? "Saving..." : "Save and Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}