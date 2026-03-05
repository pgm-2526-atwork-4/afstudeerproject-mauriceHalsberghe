import StarIcon from "@/public/star.svg";
import StarHalfIcon from "@/public/star_half.svg";
import StarEmptyIcon from "@/public/star_empty.svg";

import RatingStarsStyles from '@/app/styles/components/ratingstars.module.css'

type Props = {
    amount: number;
};

export default function RatingStars({ amount }: Props) {
    
    const stars = [];

    const fullStars = Math.floor(amount);
    const hasHalfStar = amount % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
        stars.push(<StarIcon key={`full-${i}`} />);
    }

    if (hasHalfStar) {
        stars.push(<StarHalfIcon key="half" />);
    }

    while (stars.length < 5) {
        stars.push(<StarEmptyIcon key={`empty-${stars.length}`} />);
    }

    return <div className={RatingStarsStyles.stars}>{stars}<p>{amount}</p></div>;
    }