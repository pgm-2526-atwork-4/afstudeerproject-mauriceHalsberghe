"use client";

import { AuthContext } from '@/context/AuthContext';
import { useContext } from "react";

import LogoutButton from "@/app/components/LogoutButton";
import Image from 'next/image';

import ButtonStyles from '@/app/styles/components/button.module.css'
import ProfileStyles from '@/app/styles/pages/profile.module.css'

import EmptyView from '@/app/components/EmptyView';

export default function Profile() {
    const auth = useContext(AuthContext);

    if (auth?.loading) {
        return <main>Loading...</main>;
    }

    if (!auth?.user) {
        return (
            <EmptyView title='Not logged in' btnText='Log In' btnUrl='/login' icon='profile'/>
        );
    }


    return (
        <main className={ProfileStyles.profile}>

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

        </main>
    )
}