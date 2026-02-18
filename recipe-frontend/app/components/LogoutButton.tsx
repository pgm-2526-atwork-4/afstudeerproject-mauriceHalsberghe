"use client";

import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const auth = useContext(AuthContext);
  const router = useRouter();

  if (!auth) return null;

  const { logout } = auth;

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return <button onClick={handleLogout}>Logout</button>;
}
