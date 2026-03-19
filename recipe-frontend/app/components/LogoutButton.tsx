"use client";

import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

import ButtonStyles from '@/app/styles/components/button.module.css'

import LogoutIcon from "@/public/logout.svg"

type Props = {
  type?: string;
}

export default function LogoutButton({type} : Props) {
  const auth = useContext(AuthContext);
  const router = useRouter();

  if (!auth) return null;

  const { logout } = auth;

  function handleLogout() {
    logout();
    router.push("/login");
  }

  let className = `${ButtonStyles.button}`;

  if (type) className = ButtonStyles[type];

  return (
    <button className={className} onClick={handleLogout}>
      <LogoutIcon />
      Logout
    </button>
  )
}
