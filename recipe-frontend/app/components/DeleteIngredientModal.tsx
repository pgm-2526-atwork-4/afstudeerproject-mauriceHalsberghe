"use client";

import { useState } from "react";
import { API_URL } from "@/lib/api";
import ModalStyles from "@/app/styles/components/modal.module.css";
import ButtonStyles from "@/app/styles/components/button.module.css";

type Props = {
  ingredientId: number;
  type: string;
  onClose: () => void;
  onSuccess: () => void;
};

export default function DeleteIngredientModal({
  ingredientId,
  type,
  onClose,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/${type}/${ingredientId}`, {
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
    <div className={ModalStyles.modalOverlay} onClick={handleBackdropClick}>
      <div className={ModalStyles.modal}>
        <div className={ModalStyles.text}>
          <h2 className={ModalStyles.title}>Delete Ingredient</h2>
          <p className={ModalStyles.subtitle}>
            Are you sure you want to remove this ingredient?
          </p>
        </div>

        {error && <p className={ModalStyles.error}>{error}</p>}

        <div className={ModalStyles.buttons}>
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
