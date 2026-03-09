"use client";

import { useState, useEffect } from "react";
import { API_URL } from "@/lib/api";
import IngredientStyles from "@/app/styles/pages/ingredients.module.css";
import RatingModalStyles from '@/app/styles/components/ratingmodal.module.css';
import ButtonStyles from '@/app/styles/components/button.module.css';

type QuantityUnit = {
    id: number;
    name: string;
    shortName: string;
};

type InventoryIngredient = {
    id: number;
    quantity?: number;
    quantityUnit?: QuantityUnit;
    ingredient: {
        id: number;
        name: string;
        alwaysInStock: boolean;
        ingredientTypeId: number;
    };
};

type Props = {
    ingredient: InventoryIngredient;
    onClose: () => void;
    onSuccess: () => void;
};

export default function EditIngredientModal({ ingredient, onClose, onSuccess }: Props) {
    const [name, setName] = useState(ingredient.ingredient.name);
    const [quantity, setQuantity] = useState<number | undefined>(ingredient.quantity);
    const [unitId, setUnitId] = useState<number | undefined>(ingredient.quantityUnit?.id);
    const [quantityUnits, setQuantityUnits] = useState<QuantityUnit[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isQuantityFilled = quantity !== undefined;
    const isUnitFilled = unitId !== undefined;

    const isInvalidQuantity =
        (isQuantityFilled && !isUnitFilled) ||
        (!isQuantityFilled && isUnitFilled);

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

    const handleSave = async () => {
        if (!name.trim()) return;

        if (isInvalidQuantity) {
            setError("Please fill both quantity and unit, or leave both empty.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${API_URL}/api/InventoryIngredient/${ingredient.id}`, {
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

    return (
        <div className={RatingModalStyles.modalOverlay} onClick={handleBackdropClick}>
        <div className={RatingModalStyles.modal}>

            <h2 className={RatingModalStyles.title}>Edit Ingredient</h2>

            <div className={RatingModalStyles.inputs}>

                <input
                    className={RatingModalStyles.input}
                    type="number"
                    value={quantity ?? ""}
                    onChange={(e) => {
                        setQuantity(e.target.value === "" ? undefined : Number(e.target.value));
                        setError(null);
                    }}
                    placeholder="Quantity"
                    min={0}
                />

                <select
                    className={IngredientStyles.select}
                    value={unitId ?? ""}
                    onChange={(e) =>
                        setUnitId(e.target.value === "" ? undefined : Number(e.target.value))
                    }
                    >
                    <option value="">Select unit</option>
                    {quantityUnits.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                        {unit.name}
                        </option>
                    ))}
                </select>


                {error && <p className={IngredientStyles.error}>{error}</p>}

            </div>

            <div className={RatingModalStyles.buttons}>
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