import { useState } from "react"
import RatingStars from "./RatingStars"

import RatingModalStyles from '@/app/styles/components/ratingmodal.module.css'
import ButtonStyles from '@/app/styles/components/button.module.css'

type Props = {
  userId: number;
  recipeId: number;
  onClose: () => void;
  onRated: () => void;
}

export default function RatingModal({ userId, recipeId, onClose, onRated }: Props) {
  const [amount, setAmount] = useState(0);
  const dbValue = amount * 2;

  const submitReview = async () => {
    try {
      const response = await fetch(`http://localhost:5041/api/Review?userId=${userId}&recipeId=${recipeId}&rating=${dbValue}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      })

      if (!response.ok) {
        throw new Error("Failed to submit review")
      }
      
      onRated();
      onClose();
    } catch (error) {
      console.error("Error submitting review:", error)
    }
  }

  return (
    <div className={RatingModalStyles.modal}>

      <div className={RatingModalStyles.text}>
        <h2 className={RatingModalStyles.title}>Rate this recipe</h2>
        <p className={RatingModalStyles.subtitle}>What did you think of this recipe?</p>
      </div>

      <RatingStars amount={amount} interactive onRate={setAmount} />

      <div className={RatingModalStyles.buttons}>
        <button className={ButtonStyles.secondaryButton} onClick={onClose}>Cancel</button>
        <button className={ButtonStyles.button} onClick={submitReview} disabled={amount === 0}>
          Submit
        </button>
      </div>

    </div>
  )
}