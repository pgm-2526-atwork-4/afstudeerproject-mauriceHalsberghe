"use client";

import { AuthContext } from '@/context/AuthContext';
import { useContext, useState } from "react";

import LogoutButton from "@/app/components/LogoutButton";
import Image from 'next/image';

import ProfileStyles from '@/app/styles/pages/profile.module.css'
import ProfileLink from '@/app/components/ProfileLink';
import EmptyView from '@/app/components/EmptyView';

import EditIcon  from "@/public/edit.svg";
import CrossIcon  from "@/public/cross.svg";
import CheckIcon  from "@/public/checkmark.svg";


import HeartIcon from "@/public/heart.svg";
import ChefIcon from "@/public/chefhat.svg";
import PreferencesIcon from "@/public/preferences.svg";
import AvatarUpload from '@/app/components/AvatarUpload';

export default function Profile() {
    const [editing, setEditing] = useState(false)
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

                <div className={ProfileStyles.profileInfo}>
                    <div className={ProfileStyles.image}>
                        {
                            !editing ? 
                                <Image 
                                    width={256} 
                                    height={256} 
                                    alt={auth.user.username}
                                    className={ProfileStyles.avatar} 
                                    src={auth.user.avatar ? `http://localhost:5041/uploads/avatars/${auth.user.avatar}` : '/avatar.svg'}
                                /> :
                                <AvatarUpload size={112} userId={auth.user.id} username={auth.user.username} onUploadSuccess={() => setEditing(false)} />
                        }
                        <button className={ProfileStyles.edit} onClick={() => setEditing(prev => !prev)}>
                            {!editing ? 
                                <EditIcon className={ProfileStyles.editIcon}/> : 
                                <CrossIcon className={ProfileStyles.editIcon}/>
                            }
                        </button>

                    </div>

                    <div className={ProfileStyles.names}>
                        <p className={ProfileStyles.username}>{auth.user.username}</p>
                        <p className={ProfileStyles.email}>{auth.user.email}</p>
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