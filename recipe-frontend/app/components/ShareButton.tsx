"use client";

import { useState } from "react";

import ButtonStyles from "@/app/styles/components/button.module.css";
import DetailStyles from "@/app/styles/pages/recipe-detail.module.css"
import ShareIcon from "@/public/share.svg";

interface ShareButtonProps {
    title: string;
}

export default function ShareButton({ title }: ShareButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        const url = window.location.href;

        if (navigator.share) {
            try {
                await navigator.share({ title, url });
            } catch (err) {
            }
        } else {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <button className={ButtonStyles.xsButton} onClick={handleShare}>
            <ShareIcon/>
            <span className={DetailStyles.editSpan}>{copied ? "Copied!" : "Share"}</span>
        </button>
    );
}