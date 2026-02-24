"use client";

import NavBarStyles from '@/app/styles/components/navbar.module.css';
import Link from "next/link";
import { usePathname } from "next/navigation";

import HomeIcon from '@/public/home.svg'
import AppleIcon from '@/public/apple.svg'
import HeartIcon from '@/public/heart.svg'
import CartIcon from '@/public/cart.svg'
import ProfileIcon from '@/public/profile.svg'

function NavBar() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <nav className={NavBarStyles.navbar}>
            <ul className={NavBarStyles.navlist}>
                <li 
                    className={`${NavBarStyles.navitem} ${
                    isActive("/") ? NavBarStyles["navitem-current"] : ""}`}  
                >
                    <Link href={'./'}><HomeIcon className={NavBarStyles.icon} />Home</Link>
                </li>
                <li 
                    className={`${NavBarStyles.navitem} ${
                    isActive("/ingredients") ? NavBarStyles["navitem-current"] : ""}`}  
                >
                    <Link href={'./ingredients'}><AppleIcon className={NavBarStyles.icon} />Ingedients</Link>
                </li>
                <li 
                    className={`${NavBarStyles.navitem} ${
                    isActive("/liked-recipes") ? NavBarStyles["navitem-current"] : ""}`}  
                >
                    <Link href={'./liked-recipes'}><HeartIcon className={NavBarStyles.icon} />Liked</Link>
                </li>
                <li 
                    className={`${NavBarStyles.navitem} ${
                    isActive("/shopping-list") ? NavBarStyles["navitem-current"] : ""}`}  
                >
                    <Link href={'./shopping-list'}><CartIcon className={NavBarStyles.icon} />List</Link>
                </li>
                <li 
                    className={`${NavBarStyles.navitem} ${
                    isActive("/profile") ? NavBarStyles["navitem-current"] : ""}`}  
                >
                    <Link href={'./profile'}><ProfileIcon className={NavBarStyles.icon} />Profile</Link>
                </li>
            </ul>
        </nav>
    );
}

export default NavBar;