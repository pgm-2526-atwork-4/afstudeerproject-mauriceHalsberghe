"use client";

import NavBarStyles from '@/app/styles/components/navbar.module.css';
import ButtonStyles from '@/app/styles/components/button.module.css';

import Link from "next/link";
import { usePathname } from "next/navigation";

import LogoIcon from '@/public//mealio_logo.svg'
import HomeIcon from '@/public/home.svg'
import AppleIcon from '@/public/apple.svg'
import HeartIcon from '@/public/heart.svg'
import CartIcon from '@/public/cart.svg'
import ProfileIcon from '@/public/profile.svg'

import LogoutButton from './LogoutButton';
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import Image from 'next/image';
import { API_URL } from '@/lib/api';

function NavBar() {
    const pathname = usePathname();

    const isActive = (path: string) =>
        pathname.replaceAll('/', '') === path.replaceAll('/', '');    

    const auth = useContext(AuthContext);

    return (
        <nav className={NavBarStyles.navbar}>
            <Link href={'/'} className={NavBarStyles.logo}>
                <LogoIcon />
                Mealio
            </Link>
            <ul className={NavBarStyles.navlist}>
                <li 
                    className={`${NavBarStyles.navitem} ${
                    isActive("/") ? NavBarStyles["navitem-current"] : ""}`}  
                >
                    <Link href={'/'}><HomeIcon className={NavBarStyles.icon} />Home</Link>
                </li>
                <li 
                    className={`${NavBarStyles.navitem} ${
                    isActive("/ingredients") ? NavBarStyles["navitem-current"] : ""}`}  
                >
                    <Link href={'/ingredients'}><AppleIcon className={NavBarStyles.icon} />Ingredients</Link>
                </li>
                <li 
                    className={`${NavBarStyles.navitem} ${
                    isActive("/liked-recipes") ? NavBarStyles["navitem-current"] : ""}`}  
                >
                    <Link href={'/liked-recipes'}><HeartIcon className={NavBarStyles.icon} />Liked</Link>
                </li>
                <li 
                    className={`${NavBarStyles.navitem} ${
                    isActive("/shopping-list") ? NavBarStyles["navitem-current"] : ""}`}  
                >
                    <Link href={'/shopping-list'}><CartIcon className={NavBarStyles.icon} />List</Link>
                </li>
                <li 
                    className={`${NavBarStyles.navitem} ${
                    isActive("/profile") ? NavBarStyles["navitem-current"] : ""}`}  
                >
                    <Link href={'/profile'}><ProfileIcon className={NavBarStyles.icon} />Profile</Link>
                </li>
            </ul>
            
            <div className={NavBarStyles.navitemLast}>
                <div className={`${NavBarStyles.navitem} ${
                    isActive("/profile") ? NavBarStyles["navitem-current"] : ""}`}  >

                    <Link href={'/profile'}>
                        <Image
                            className={NavBarStyles.avatar}
                            width={64}
                            height={64}
                            alt='Avatar'
                            src={
                                auth?.user?.avatar
                                ? `${API_URL}/uploads/avatars/${auth?.user?.avatar}`
                                : "/avatar.svg"
                            }
                        />
                        <div className={NavBarStyles.userInfo}>
                            <p className={NavBarStyles.username}>{auth?.user?.username || 'No user'}</p>
                            <p className={NavBarStyles.email}>{auth?.user?.email || 'Not logged in'}</p>
                        </div>

                    </Link>
                </div>
                {
                    auth?.user ?
                    <LogoutButton type="secondaryButton" /> :
                    <Link className={ButtonStyles.button} href={'/login'}>Log in</Link>
                }
            </div>
        </nav>
    );
}

export default NavBar;