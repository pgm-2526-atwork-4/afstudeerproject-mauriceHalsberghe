"use client";

import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

import ButtonStyles from '@/app/styles/components/button.module.css'

export default function LogoutButton() {
  const auth = useContext(AuthContext);
  const router = useRouter();

  if (!auth) return null;

  const { logout } = auth;

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return <button className={ButtonStyles.button} onClick={handleLogout}>Logout</button>;
}
