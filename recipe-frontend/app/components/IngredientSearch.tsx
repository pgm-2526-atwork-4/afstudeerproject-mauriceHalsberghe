"use client";

import { useState, useEffect } from "react";
import Select from "react-select";

type Ingredient = {
  id: number;
  name: string;
  alwaysInStock: boolean;
};

export type IngredientOption = {
  value: number;
  label: string;
};

type Props = {
  onIngredientChange?: (ingredientId: number | null) => void;
};

export default function IngredientSearch({ onIngredientChange }: Props) {

  const [ingredients, setIngredients] = useState<IngredientOption[]>([]);
  const [selectedIngredient, setSelectedIngredient] = useState<IngredientOption | null>(null);

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const response = await fetch("http://localhost:5041/api/ingredients");
        const data = await response.json();

        const options = data.map((ingredient: Ingredient) => ({
          value: ingredient.id,
          label: ingredient.name,
        }));

        setIngredients(options);
      } catch (error) {
        console.error("Error fetching ingredients:", error);
      }
    };

    fetchIngredients();
  }, []);

  const handleChange = (option: IngredientOption | null) => {
    setSelectedIngredient(option);

    onIngredientChange?.(option?.value ?? null);
  };
  

  return (
    <Select
      instanceId="ingredient-select"
      value={selectedIngredient}
      onChange={handleChange}
      options={ingredients}
      isClearable
      isSearchable
    />
  );
}