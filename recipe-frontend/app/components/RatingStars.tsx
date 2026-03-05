import StarIcon from "@/public/star.svg";
import StarHalfIcon from "@/public/star_half.svg";
import StarEmptyIcon from "@/public/star_empty.svg";

import RatingStarsStyles from '@/app/styles/components/ratingstars.module.css'
import { useRef, useState } from "react";

type Props = {
    amount: number;
    interactive?: boolean;
    onRate?: (value: number) => void;
};

export default function RatingStars({ amount, interactive = false, onRate }: Props) {
    const [dragging, setDragging] = useState(false);
    const [dragValue, setDragValue] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const display = dragging && dragValue !== null ? dragValue : amount;

    const computeValueFromX = (clientX: number): number => {
        if (!containerRef.current) return 0;
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const raw = (x / rect.width) * 5;
        return Math.max(0.5, Math.round(raw * 2) / 2);
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!interactive) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        setDragging(true);
        const val = computeValueFromX(e.clientX);
        setDragValue(val);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!interactive || !dragging) return;
        const val = computeValueFromX(e.clientX);
        setDragValue(val);
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!interactive || !dragging) return;
        const val = computeValueFromX(e.clientX);
        onRate?.(val);
        setDragging(false);
        setDragValue(null);
    };

    const stars = Array.from({ length: 5 }, (_, i) => {
        const starNumber = i + 1;
        const filled = display >= starNumber;
        const half = !filled && display >= starNumber - 0.5;
        const Icon = filled ? StarIcon : half ? StarHalfIcon : StarEmptyIcon;
        return <Icon key={i} />;
    });

    return (
        <div
            ref={containerRef}
            className={` ${RatingStarsStyles.stars} ${interactive && RatingStarsStyles.starsInteractive} `}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
        >
        {stars}
        </div>
    );
}