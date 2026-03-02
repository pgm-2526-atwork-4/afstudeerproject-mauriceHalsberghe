import Link from "next/link";
import ProfileLinkStyles from '@/app/styles/components/profilelink.module.css';

import Chevron from "@/public/chevron.svg";

type Props = {
  url: string;
  title: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

export default function ProfileLink({ url, title, icon: Icon }: Props) {
  return (
    <Link href={url} className={ProfileLinkStyles.link}>
      <div className={ProfileLinkStyles.text}>
        <Icon />
        <p>{title}</p>
      </div>
      <Chevron />
    </Link>
  );
}