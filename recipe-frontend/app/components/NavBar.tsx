import NavBarStyles from '@/app/styles/components/navbar.module.css';

import Link from "next/link";

import HomeIcon from '@/public/home.svg'
import AppleIcon from '@/public/apple.svg'
import HeartIcon from '@/public/heart.svg'
import CartIcon from '@/public/cart.svg'
import ProfileIcon from '@/public/profile.svg'

function NavBar() {
  return (
    <nav className={NavBarStyles.navbar}>
        <ul className={NavBarStyles.navlist}>
            <li className={NavBarStyles.navitem}>
                <Link href={'./'}><HomeIcon />Home</Link>
            </li>
            <li className={NavBarStyles.navitem}>
                <Link href={'./ingredients'}><AppleIcon />Ingedients</Link>
            </li>
            <li className={NavBarStyles.navitem}>
                <Link href={'./liked-recipes'}><HeartIcon />Liked</Link>
            </li>
            <li className={NavBarStyles.navitem}>
                <Link href={'./shopping-list'}><CartIcon />List</Link>
            </li>
            <li className={NavBarStyles.navitem}>
                <Link href={'./profile'}><ProfileIcon />Profile</Link>
            </li>
        </ul>
    </nav>
  );
}

export default NavBar;