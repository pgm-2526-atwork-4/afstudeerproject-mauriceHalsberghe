"use client";

import { useState } from "react";
import { API_URL } from "@/lib/api";
import RatingModalStyles from '@/app/styles/components/ratingmodal.module.css';
import ButtonStyles from '@/app/styles/components/button.module.css';

type Props = {
  ingredientId: number;
  onClose: () => void;
  onSuccess: () => void;
};

export default function DeleteIngredientModal({
  ingredientId,
  onClose,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/InventoryIngredient/${ingredientId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        setError("Failed to delete ingredient. Please try again.");
        return;
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className={RatingModalStyles.modalOverlay} onClick={handleBackdropClick}>
      <div className={RatingModalStyles.modal}>

        <div className={RatingModalStyles.text}>
          <h2 className={RatingModalStyles.title}>Delete Ingredient</h2>
          <p className={RatingModalStyles.subtitle}>Are you sure you want to remove this ingredient from your inventory?</p>
        </div>

        {error && <p className={RatingModalStyles.error}>{error}</p>}

        <div className={RatingModalStyles.buttons}>
          <button
            className={ButtonStyles.secondaryButton}
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            className={ButtonStyles.buttonRed}
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>

      </div>
    </div>
  );
}