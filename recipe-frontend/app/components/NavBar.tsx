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
                    <Link href={'./'}><HomeIcon />Home</Link>
                </li>
                <li 
                    className={`${NavBarStyles.navitem} ${
                    isActive("/ingredients") ? NavBarStyles["navitem-current"] : ""}`}  
                >
                    <Link href={'./ingredients'}><AppleIcon />Ingedients</Link>
                </li>
                <li 
                    className={`${NavBarStyles.navitem} ${
                    isActive("/liked-recipes") ? NavBarStyles["navitem-current"] : ""}`}  
                >
                    <Link href={'./liked-recipes'}><HeartIcon />Liked</Link>
                </li>
                <li 
                    className={`${NavBarStyles.navitem} ${
                    isActive("/shopping-list") ? NavBarStyles["navitem-current"] : ""}`}  
                >
                    <Link href={'./shopping-list'}><CartIcon />List</Link>
                </li>
                <li 
                    className={`${NavBarStyles.navitem} ${
                    isActive("/profile") ? NavBarStyles["navitem-current"] : ""}`}  
                >
                    <Link href={'./profile'}><ProfileIcon />Profile</Link>
                </li>
            </ul>
        </nav>
    );
}

export default NavBar;