"use client";

import { API_URL } from "@/lib/api";

import { AuthContext } from '@/context/AuthContext';
import { useContext, useState } from "react";

import LogoutButton from "@/app/components/LogoutButton";
import Image from 'next/image';

import ProfileStyles from '@/app/styles/pages/profile.module.css'
import ProfileLink from '@/app/components/ProfileLink';
import EmptyView from '@/app/components/EmptyView';

import AvatarUpload from '@/app/components/AvatarUpload';
import { InstallAppModal } from "@/app/components/InstallAppModal";

import EditIcon  from "@/public/edit.svg";
import CrossIcon  from "@/public/cross.svg";
import CheckIcon  from "@/public/checkmark.svg";
import HeartIcon from "@/public/heart.svg";
import ChefIcon from "@/public/chefhat.svg";
import PreferencesIcon from "@/public/preferences.svg";
import InstallIcon from "@/public/install.svg"

export default function Profile() {
    const [editing, setEditing] = useState(false);
    const [usernameInput, setUsernameInput] = useState("");
    const [usernameError, setUsernameError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const [showInstallModal, setShowInstallModal] = useState(false);
    
    const isInPWA = typeof window !== 'undefined' && 
        window.matchMedia('(display-mode: standalone)').matches;

    const auth = useContext(AuthContext);

    if (!auth?.user) {
        return (
            <EmptyView title='Not logged in' text='Log in to see profile details' btnText='Log In' btnUrl='/login' icon='profile'/>
        );
    }    

    const handleStartEditing = () => {
        setUsernameInput(auth.user!.username);
        setUsernameError(null);
        setEditing(true);
    };

    
    const handleCancel = () => {
        setEditing(false);
        setUsernameError(null);
    };

    const handleSaveUsername = async () => {
        const trimmed = usernameInput.trim();
        if (!trimmed) return setUsernameError("Username can't be empty.");
        if (trimmed === auth.user!.username) return setEditing(false);

        setSaving(true);
        setUsernameError(null);
        try {
            const res = await fetch(`${API_URL}/api/users/username`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${auth.token}`,
                },
                body: JSON.stringify({ username: trimmed }),
            });

            if (res.ok) {
                auth.setUser({ ...auth.user!, username: trimmed });
                setEditing(false);
            } else if (res.status === 409) {
                setUsernameError("Username already taken.");
            } else {
                setUsernameError("Something went wrong.");
            }
        } catch {
            setUsernameError("Something went wrong.");
        } finally {
            setSaving(false);
        }
    };

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
                                    src={auth.user.avatar ? `${API_URL}/uploads/avatars/${auth.user.avatar}` : '/avatar.svg'}
                                /> :
                                <AvatarUpload size={112} userId={auth.user.id} username={auth.user.username} onUploadSuccess={() => setEditing(false)} />
                        }
                        <button className={ProfileStyles.edit} onClick={editing ? handleCancel : handleStartEditing}>
                            {!editing ? 
                                <EditIcon className={ProfileStyles.editIcon}/> : 
                                <CrossIcon className={ProfileStyles.editIcon}/>
                            }
                        </button>

                    </div>

                    <div className={ProfileStyles.names}>
                        {!editing
                            ? <p className={ProfileStyles.username}>{auth.user.username}</p>
                            : <div className={ProfileStyles.usernameEdit}>
                                <input
                                    className={ProfileStyles.usernameInput}
                                    value={usernameInput}
                                    onChange={e => setUsernameInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSaveUsername()}
                                    disabled={saving}
                                    autoFocus
                                    placeholder="Username..."
                                />
                                <button className={ProfileStyles.confirmEdit} onClick={handleSaveUsername} disabled={saving}>
                                    <CheckIcon className={ProfileStyles.editIcon}/>
                                </button>
                                {usernameError && <p className={ProfileStyles.usernameError}>{usernameError}</p>}
                            </div>
                        }
                        <p className={ProfileStyles.email}>{auth.user.email}</p>
                    </div>

                </div>

                <div className={ProfileStyles.links}>
                    <ProfileLink url='/liked-recipes' title='Liked recipes' icon={HeartIcon}/>
                    <ProfileLink url={`/users/${auth.user.username}`} title='Your recipes' icon={ChefIcon}/>
                    <ProfileLink url='/profile/preferences' title='Preferences' icon={PreferencesIcon}/>
                    {!isInPWA && (
                        <button className={ProfileStyles.installApp} onClick={() => setShowInstallModal(true)}>
                            <InstallIcon />
                            Install App
                        </button>
                    )}
                </div>

                <LogoutButton />

                <InstallAppModal
                    isOpen={showInstallModal}
                    onClose={() => setShowInstallModal(false)}
                />

        </main>
    )
}