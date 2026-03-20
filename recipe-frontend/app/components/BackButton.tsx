import Link from "next/link";
import ChevronIcon from "@/public/chevron.svg"

import BackButtonStyles from "@/app/styles/components/backbutton.module.css"

type Props = {
    url: string;
    absolute: boolean;
}

export default function BackButton ({url, absolute} : Props) {
    return (
        <Link href={url} className={`${BackButtonStyles.backButton} ${absolute && BackButtonStyles.backAbsolute }`} >
            <ChevronIcon />
            <p>Back</p>
        </Link>
    )
}