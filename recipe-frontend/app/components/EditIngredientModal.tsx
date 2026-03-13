"use client";

import { useState, useEffect, useRef } from "react";
import { API_URL } from "@/lib/api";
import IngredientStyles from "@/app/styles/pages/ingredients.module.css";
import ModalStyles from "@/app/styles/components/modal.module.css";
import ButtonStyles from "@/app/styles/components/button.module.css";
import { InventoryIngredient, QuantityUnit } from "@/types/IngredientTypes";

type Props = {
  ingredient: InventoryIngredient;
  type: string;
  onClose: () => void;
  onSuccess: () => void;
};

export default function EditIngredientModal({
  ingredient,
  type,
  onClose,
  onSuccess,
}: Props) {
  const [name, setName] = useState(ingredient.ingredient.name);
  const [quantity, setQuantity] = useState<number | undefined>(
    ingredient.quantity,
  );
  const [unitId, setUnitId] = useState<number | undefined>(
    ingredient.quantityUnit?.id,
  );
  const [quantityUnits, setQuantityUnits] = useState<QuantityUnit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isQuantityFilled = quantity !== undefined;
  const isUnitFilled = unitId !== undefined;

  const isInvalidQuantity =
    (isQuantityFilled && !isUnitFilled) || (!isQuantityFilled && isUnitFilled);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const res = await fetch(`${API_URL}/api/QuantityUnits`);
        if (!res.ok) return;
        const data: QuantityUnit[] = await res.json();
        setQuantityUnits(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUnits();
  }, []);

  const startHold = (quantityChange: number) => {
    changeQuantity(quantityChange);
    intervalRef.current = setInterval(() => {
      changeQuantity(quantityChange);
    }, 120);
  };

  const stopHold = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopHold();
  }, []);

  const handleSave = async () => {
    if (!name.trim()) return;

    if (isInvalidQuantity) {
      setError("Please fill both quantity and unit, or leave both empty.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/${type}/${ingredient.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredientName: name.trim(),
          quantity: quantity ?? null,
          quantityUnitId: unitId ?? null,
        }),
      });

      if (!res.ok) {
        setError("Failed to update ingredient. Please try again.");
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

  let stepSize = 1;
  if (unitId === 1 || unitId == 2) {
    stepSize = 50;
  }

  const changeQuantity = (quantityChange: number) => {
    setQuantity((prev) => {
      if (prev === undefined) return prev;

      const next = prev + quantityChange;

      if (next < stepSize) return stepSize;
      return next;
    });
  };

  return (
    <div className={ModalStyles.modalOverlay} onClick={handleBackdropClick}>
      <div className={ModalStyles.modal}>
        <h2 className={ModalStyles.title}>Edit Ingredient</h2>

        <div className={ModalStyles.inputs}>
          <div className={ModalStyles.quantityInputs}>
            <button
              className={ButtonStyles.smallButton}
              disabled={(quantity ?? 0) <= stepSize}
              onMouseDown={() => startHold(-stepSize)}
              onMouseUp={stopHold}
              onMouseLeave={stopHold}
              onTouchStart={() => startHold(-stepSize)}
              onTouchEnd={stopHold}
            >
              -
            </button>

            <input
              className={ModalStyles.input}
              type="number"
              step="0.1"
              value={quantity ?? ""}
              onChange={(e) => {
                setQuantity(
                  e.target.value === "" ? undefined : Number(e.target.value),
                );
                setError(null);
              }}
              placeholder="Quantity"
              min={0}
            />

            <button
              className={ButtonStyles.smallButton}
              onMouseDown={() => startHold(stepSize)}
              onMouseUp={stopHold}
              onMouseLeave={stopHold}
              onTouchStart={() => startHold(stepSize)}
              onTouchEnd={stopHold}
            >
              +
            </button>
          </div>

          <select
            className={IngredientStyles.select}
            value={unitId ?? ""}
            onChange={(e) =>
              setUnitId(
                e.target.value === "" ? undefined : Number(e.target.value),
              )
            }
          >
            <option value="">Select unit</option>
            {quantityUnits.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name}
              </option>
            ))}
          </select>

          {error && <p className={ModalStyles.error}>{error}</p>}
        </div>

        <div className={ModalStyles.buttons}>
          <button
            className={ButtonStyles.secondaryButton}
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className={ButtonStyles.button}
            onClick={handleSave}
            disabled={loading || !name.trim()}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
