"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-provider";
import { createClient } from "@/lib/supabase-client";
import { createStudentAPI } from "@/hooks/use-students";
import { RoleEnum } from "@/types";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

function InvitePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const supabase = createClient();
  const { acceptInvite } = createStudentAPI(supabase);

  const [isProcessing, setIsProcessing] = useState(false);

  const classId = searchParams.get("class_id");
  const className = searchParams.get("class_name");
  const invitedBy = searchParams.get("invited_by");
  const inviteEmail = searchParams.get("invite_email");

  useEffect(() => {
    if (!classId) {
      toast.error("Invalid invite link. Missing class ID.");
      router.push("/");
    }
  }, [classId, router]);

  const handleGoogleLogin = async () => {
    setIsProcessing(true);
    // When they log in with Google, we want them to return to this EXACT invite page so we can process the acceptance
    const currentUrl = new URL(window.location.href);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(currentUrl.pathname + currentUrl.search)}`,
      },
    });

    if (error) {
      toast.error(error.message);
      setIsProcessing(false);
    }
  };

  const handleAcceptInvite = async () => {
    if (!user) return;
    setIsProcessing(true);

    try {
      // 1. If the user does not have a profile, they must go to setup first.
      if (!profile) {
        toast.info("Please complete your profile setup first!");
        // We pass the class_id and lock the role to STUDENT
        router.push(
          `/setup?role=STUDENT&class_id=${classId}&invite_email=${encodeURIComponent(inviteEmail || "")}`
        );
        return;
      }

      // 2. Ensure they are a student
      if (profile && user.user_metadata?.role !== RoleEnum.STUDENT) {
        // Update role if needed (though existing users might be stuck if they are an Educator)
        // It's safest to just let them be a student if they accept a student invite, or warn them.
        if (user.user_metadata?.role === RoleEnum.EDUCATOR || user.user_metadata?.role === RoleEnum.ADMIN) {
          toast.error("You are registered as an Educator/Admin. You cannot join as a Student.");
          setIsProcessing(false);
          return;
        }

        // If role isn't set properly, set it
        await supabase.auth.updateUser({ data: { role: RoleEnum.STUDENT } });
      }

      // 3. Insert into students table
      if (!classId) {
        throw new Error("Invalid invite link. Missing class ID.");
      }

      const acceptResult = await acceptInvite(classId, inviteEmail || user.email || undefined);
      if (!acceptResult.success) {
        throw new Error(acceptResult.error || "Failed to accept invite");
      }

      toast.success("Successfully joined the classroom!");

      // 4. Navigate to student dashboard
      // We do a hard navigation to ensure middleware syncs correctly
      window.location.href = `/student/${user.id}/dashboard`;

    } catch (error: any) {
      toast.error(error.message || "Failed to join classroom");
      setIsProcessing(false);
    }
  };

  if (!classId) return null;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f0]">
        <Loader2 className="h-10 w-10 animate-spin text-[#29A177]" />
      </div>
    );
  }

  // Compute once, use inside JSX
  const isWrongRecipient = !!user && !!inviteEmail &&
    user.email?.toLowerCase() !== inviteEmail.toLowerCase();

    console.log("iswrong:", isWrongRecipient);
  const notLoggedIn = (
    <>
    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
      <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    </div>

    <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Class Invite</h1>

    <p className="text-gray-600 mb-6 text-lg">
      Log In to view the invite information.
    </p>

    <div className="space-y-4">
      <button
        onClick={handleGoogleLogin}
        disabled={isProcessing}
        className="w-full bg-white text-gray-700 font-bold py-3 px-4 rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-70"
      >
        {isProcessing ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          </>
        )}
        Continue with Google
      </button>
    </div>
    </>
  );

  const wrongRecipient = (
    <>
    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
      <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    </div>
    <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h1>
    <p className="text-gray-600 mb-6">This invite is not intended for your account.</p>
    <button
      onClick={() => router.replace("/")}
      className="w-full bg-[#29A177] text-white font-bold py-3 px-4 rounded-xl"
    >
      Go to Home
    </button>
    </>
  );
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f5f0] px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8 text-center border border-gray-100">
        {!user ? (
  /* 👤 NOT LOGGED IN */
  notLoggedIn
) : isWrongRecipient ? (
  /* 🚫 LOGGED IN BUT WRONG USER */
  wrongRecipient
) : (
  /* ✅ LOGGED IN + CORRECT USER */
  <>
    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
      <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    </div>

    <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Class Invite</h1>

    <p className="text-gray-600 mb-6 text-lg">
      {invitedBy ? (
        <span className="font-semibold text-gray-800">{invitedBy}</span>
      ) : (
        "An educator"
      )}{" "}
      invited you to join{" "}
      <span className="font-bold text-[#29A177]">{className || "their class"}</span>!
    </p>

    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-500 mb-1">Logged in as</p>
        <p className="font-medium text-gray-900">{profile?.nickname || user.email}</p>
      </div>
      <button
        onClick={handleAcceptInvite}
        disabled={isProcessing}
        className="w-full bg-[#29A177] text-white font-bold py-3 px-4 rounded-xl shadow-md hover:bg-[#208360] transition-all duration-200"
      >
        {isProcessing && <Loader2 className="w-5 h-5 animate-spin mr-2 inline-block" />}
        Accept Invite
      </button>
      <button
        onClick={() => router.push("/")}
        disabled={isProcessing}
        className="w-full bg-[#0e0f0f] text-white font-bold py-3 px-4 rounded-xl hover:bg-[#f3f3f3] hover:text-black transition-all duration-200"
      >
        Go to Dashboard
      </button>
    </div>
  </>
)}
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f5f5f0]">
          <Loader2 className="h-10 w-10 animate-spin text-[#29A177]" />
        </div>
      }
    >
      <InvitePageContent />
    </Suspense>
  );
}
