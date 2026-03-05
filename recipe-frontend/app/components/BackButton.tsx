import Link from "next/link";
import ChevronIcon from "@/public/chevron.svg"

import BackButtonStyles from "@/app/styles/components/backbutton.module.css"

type Props = {
    url: string;
}

export default function BackButton ({url} : Props) {
    return (
        <Link href={url} className={BackButtonStyles.backButton} >
            <ChevronIcon />
            Back
        </Link>
    )
}