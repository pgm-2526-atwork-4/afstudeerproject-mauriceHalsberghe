"use client";

import { AuthContext } from '@/context/AuthContext';
import { useContext } from "react";

import LogoutButton from "@/app/components/LogoutButton";
import Image from 'next/image';

import ProfileStyles from '@/app/styles/pages/profile.module.css'
import ProfileLink from '@/app/components/ProfileLink';
import EmptyView from '@/app/components/EmptyView';

import HeartIcon from "@/public/heart.svg";
import ChefIcon from "@/public/chefhat.svg";
import PreferencesIcon from "@/public/preferences.svg";

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
                        <Image 
                            width={256} 
                            height={256} 
                            alt={auth.user.username}
                            className={ProfileStyles.avatar} 
                            src={auth.user.avatar ? `http://localhost:5041/uploads/avatars/${auth.user.avatar}` : '/avatar.svg'}
                        />
                        <div className={ProfileStyles.names}>
                            <p className={ProfileStyles.username}>{auth.user.username}</p>
                            <p className={ProfileStyles.email}>{auth.user.email}</p>
                        </div>
                    </div>
                </div>

                <div className={ProfileStyles.links}>
                    <ProfileLink url='/liked-recipes' title='Liked recipes' icon={HeartIcon}/>
                    <ProfileLink url={`/users/${auth.user.username}`} title='Your recipes' icon={ChefIcon}/>
                    <ProfileLink url='/preferences' title='Preferences' icon={PreferencesIcon}/>
                </div>

                <LogoutButton />

        </main>
    )
}