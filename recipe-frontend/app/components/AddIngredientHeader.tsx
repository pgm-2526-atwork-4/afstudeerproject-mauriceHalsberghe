"use client";

import { API_URL } from "@/lib/api";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import IngredientSearch from "@/app/components/IngredientSearch";

import IngredientStyles from "@/app/styles/pages/ingredients.module.css";
import ButtonStyles from "@/app/styles/components/button.module.css";

import { IngredientOption } from "@/app/components/IngredientSearch";
import { QuantityUnit } from "@/types/IngredientTypes";

type Props = {
  postUrl?: string;
  onSuccess?: () => void;
};

export default function AddIngredientHeader({ postUrl, onSuccess }: Props) {
  const auth = useContext(AuthContext);
  const loggedUserId = auth?.user?.id;

  const [selectedIngredient, setSelectedIngredient] = useState<IngredientOption | null>(null);
  const [quantity, setQuantity] = useState<number | undefined>();
  const [selectedUnitId, setSelectedUnitId] = useState<number | undefined>();

  const [units, setUnits] = useState<QuantityUnit[]>([]);
  const [error, setError] = useState("");

  const isQuantityFilled = quantity !== undefined;
  const isUnitFilled = selectedUnitId !== undefined;

  const isInvalidQuantity =
    (isQuantityFilled && !isUnitFilled) ||
    (!isQuantityFilled && isUnitFilled);

  const fetchUnits = async () => {
    try {
      const res = await fetch(`${API_URL}/api/QuantityUnits`);
      if (!res.ok) return;

      const data: QuantityUnit[] = await res.json();
      setUnits(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!loggedUserId) return;

    const loadData = async () => {
        await fetchUnits();
    }

    loadData();
  }, [loggedUserId]);

  if (!postUrl) {
    return (
      <div className={IngredientStyles.form}>
        <div className={IngredientStyles.input}>
          <div className={IngredientStyles.searchWrapper}>
            <IngredientSearch
              instanceId="ingredient-search-placeholder"
              value={null}
              onIngredientChange={() => {}}
            />
          </div>
          <button
            className={`${ButtonStyles.button} ${ButtonStyles.smallButton} ${ButtonStyles.disabledButton}`}
            type="button"
            disabled
          >
            + Add
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {

    e.preventDefault();
    setError("");

    if (!loggedUserId) return;

    if (selectedIngredient === null) {
      setError("Please select an ingredient.");
      return;
    }

    if (isInvalidQuantity) {
      setError("Please fill both quantity and unit, or leave both empty.");
      return;
    }

    const formData = {
      userId: loggedUserId,
      ingredientId: selectedIngredient?.value,
      quantity: isQuantityFilled ? quantity : null,
      quantityUnitId: isUnitFilled ? selectedUnitId : null,
    };

    try {
      await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      onSuccess?.();
    } catch (err) {
      console.error(err);
    }

    setSelectedIngredient(null);
    setQuantity(undefined);
    setSelectedUnitId(undefined);
  };

  return (
    <form className={IngredientStyles.form} onSubmit={handleSubmit}>
    <div className={IngredientStyles.input}>
        <div className={IngredientStyles.searchWrapper}>
        <IngredientSearch
          instanceId="ingredient-search-active"
          value={selectedIngredient}
          onIngredientChange={(ingredient) => {
            setSelectedIngredient(ingredient);
            setQuantity(undefined);
            setSelectedUnitId(undefined);
            if (error) setError("");
          }}
        />
        </div>

        <button
        className={`${ButtonStyles.button} ${ButtonStyles.smallButton} ${
            selectedIngredient === null || isInvalidQuantity
            ? ButtonStyles.disabledButton
            : ""
        }`}
        type="submit"
        >
        + Add
        </button>
    </div>

    {selectedIngredient && !selectedIngredient.alwaysInStock && (
        <div className={IngredientStyles.quantityInput}>
        <div className={IngredientStyles.quantity}>
            <input
              type="number"
              placeholder="Quantity"
              value={quantity ?? ""}
              onChange={(e) => {
                setQuantity(e.target.value === "" ? undefined : Number(e.target.value));
                if (error) setError("");
              }}
            />
        </div>

        <div className={IngredientStyles.select}>
          <select
            value={selectedUnitId ?? ""}
            onChange={(e) => {
              setSelectedUnitId(e.target.value === "" ? undefined : Number(e.target.value));
              if (error) setError("");
            }}
          >
            <option value="">Select unit</option>
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    )}

    {error && <p className={IngredientStyles.error}>{error}</p>}
    </form>
  );
}