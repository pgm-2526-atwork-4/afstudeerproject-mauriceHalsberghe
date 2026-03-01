"use client";

import { useState, useEffect } from "react";

//https://react-select.com/home
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
  value: number | null;
  onIngredientChange?: (ingredientId: number | null) => void;
};

export default function IngredientSearch({ value, onIngredientChange }: Props) {

  const [ingredients, setIngredients] = useState<IngredientOption[]>([]);
  const [selectedIngredient, setSelectedIngredient] = useState<IngredientOption | null>(null);

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const response = await fetch("http://localhost:5041/api/ingredients");
        const data = await response.json();

        const sortedData = data.sort((a: Ingredient, b: Ingredient) =>
          a.name.localeCompare(b.name, undefined, {
            sensitivity: "base",
          })
        );

        const options = sortedData.map((ingredient: Ingredient) => ({
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

  const selectedOption = ingredients.find((i) => i.value === value) ?? null;

  const handleChange = (option: IngredientOption | null) => {
    onIngredientChange?.(option?.value ?? null);
  };
  

  return (
    <Select
      instanceId="ingredient-select"
      value={selectedOption}
      placeholder='Add Ingredient...'
      onChange={handleChange}
      options={ingredients}
      isClearable
      isSearchable
      styles={{
        control: () => ({
          display: "flex",
          borderWidth: '2px',
          borderColor: 'var(--gray-200)',
          borderRadius: '5rem',
          padding: '0 6px',          
        }),
        placeholder:(baseStyles) => ({
          ...baseStyles,
          color: 'var(--gray-300)'
        }),
        option: (baseStyles, state) => ({
          ...baseStyles,
          color: state.isSelected ? 'var(--green-300)' : 'black',
          backgroundColor: state.isSelected
            ? 'var(--green-100)'
            : state.isFocused
            ? 'var(--gray-100)'
            : baseStyles.backgroundColor,
        })
      }}
    />
  );
}