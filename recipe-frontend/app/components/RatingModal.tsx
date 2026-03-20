import { API_URL } from "@/lib/api";

import { useState } from "react";
import RatingStars from "./RatingStars";

import ModalStyles from "@/app/styles/components/modal.module.css";
import ButtonStyles from "@/app/styles/components/button.module.css";

type Props = {
  userId: number;
  recipeId: number;
  onClose: () => void;
  onRated: () => void;
};

export default function RatingModal({
  userId,
  recipeId,
  onClose,
  onRated,
}: Props) {
  const [amount, setAmount] = useState(0);
  const dbValue = amount * 2;

  const submitReview = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/Review?userId=${userId}&recipeId=${recipeId}&rating=${dbValue}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to submit review");
      }

      onRated();
      onClose();
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  return (
    <div className={ModalStyles.modal}>
      <div className={ModalStyles.text}>
        <h2 className={ModalStyles.title}>Rate this recipe</h2>
        <p className={ModalStyles.subtitle}>
          What did you think of this recipe?
        </p>
      </div>

      <RatingStars amount={amount} interactive onRate={setAmount} />

      <div className={ModalStyles.buttons}>
        <button className={ButtonStyles.secondaryButton} onClick={onClose}>
          No thanks
        </button>
        <button
          className={ButtonStyles.button}
          onClick={submitReview}
          disabled={amount === 0}
        >
          Submit
        </button>
      </div>
    </div>
  );
}
