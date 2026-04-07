"use client";

import { useAuth } from '@/contexts/auth-provider';

export default function Login() {
  const { loginWithGoogle } = useAuth()

  return (
    <button onClick={loginWithGoogle}>
      Login with Google
    </button>
  )
}