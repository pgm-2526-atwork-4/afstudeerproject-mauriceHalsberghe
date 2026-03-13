import { API_URL } from "@/lib/api";

import { useEffect, useState } from "react";

import CheckboxChecked from '@/public/checkbox_checked.svg';
import CheckboxUnchecked from '@/public/checkbox_unchecked.svg';

import CheckboxStyles from '@/app/styles/components/checkbox.module.css'

type Props = {
    initialChecked: boolean;
    listIngredientId: number;
    userId: number;
    onChange: (id: number, checked: boolean) => void;
};

export default function Checkbox({ initialChecked, userId, listIngredientId, onChange }: Props) {
    const [checked, setChecked] = useState(initialChecked);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setChecked(initialChecked);
    }, [initialChecked]);

    const toggleCheck = async () => {
        if (!userId) return;

        if (loading) return;

        const newChecked = !checked;
        setChecked(newChecked);
        onChange(listIngredientId, newChecked);

        setLoading(true);


        try {
            const response = await fetch(
                `${API_URL}/api/ListIngredients/toggle?userId=${userId}&listIngredientId=${listIngredientId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to update ingredient");
            }

        } catch (error) {
            console.error("Error updating ingredient", error);

            setChecked(!newChecked);
            onChange(listIngredientId, !newChecked);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setChecked(initialChecked);
    }, [initialChecked]);

    return (
        <div
            onClick={toggleCheck}
            className={CheckboxStyles.checkbox}
        >
            {checked ? <CheckboxChecked /> : <CheckboxUnchecked />}
        </div>
    );
}