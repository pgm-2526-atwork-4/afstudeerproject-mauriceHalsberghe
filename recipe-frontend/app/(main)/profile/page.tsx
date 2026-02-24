"use client";

import { AuthContext } from '@/context/AuthContext';
import { useContext } from "react";
import Link from "next/link";

import LogoutButton from "@/app/components/LogoutButton";
import Image from 'next/image';
import ProfileIcon from '@/public/profile.svg'

import ButtonStyles from '@/app/styles/components/button.module.css'
import ProfileStyles from '@/app/styles/pages/profile.module.css'

export default function Profile() {
    const auth = useContext(AuthContext);

    return (
        <main className={ProfileStyles.profile}>

            {auth?.user ? (
                <div>
                    <div className={ProfileStyles.profileInfo}>
                        <Image width={96} height={96} alt={auth.user.username} src={auth.user.avatar || '/avatar.svg'}/>
                        <div className={ProfileStyles.names}>
                            <p className={ProfileStyles.title}>{auth.user.username}</p>
                            <p className={ProfileStyles.title}>{auth.user.email}</p>
                        </div>
                        <LogoutButton />
                    </div>
                </div>
                ) : (
                <>
                    <h1 className={ProfileStyles.title}>Not logged in</h1>
                    <ProfileIcon className={ProfileStyles.icon} />
                    <Link href="./login" className={ButtonStyles.button}>Login</Link>
                </>
            )}

        </main>
    )
}