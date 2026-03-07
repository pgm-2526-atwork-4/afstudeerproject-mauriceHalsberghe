"use client";

import { useState } from "react";
import { AsyncPaginate, LoadOptions } from "react-select-async-paginate";
import { GroupBase } from "react-select";

type Ingredient = {
  id: number;
  name: string;
  alwaysInStock: boolean;
};

export type IngredientOption = {
  value: number;
  label: string;
  alwaysInStock: boolean;
};

type Props = {
  value: number | null;
  onIngredientChange?: (ingredient: IngredientOption | null) => void;
};

export default function IngredientSearch({ value, onIngredientChange }: Props) {
  const [selectedOption, setSelectedOption] = useState<IngredientOption | null>(null);

  const loadOptions: LoadOptions<
    IngredientOption,
    GroupBase<IngredientOption>,
    { page: number }
  > = async (search, loadedOptions, additional = { page: 1 }) => {

    const page = additional.page;
    try {
      const res = await fetch(
        `http://localhost:5041/api/ingredients?search=${encodeURIComponent(search)}&page=${page}&pageSize=10`
      );
      const data: Ingredient[] = await res.json();

      const options: IngredientOption[] = data.map((i) => ({
        value: i.id,
        label: i.name,
        alwaysInStock: i.alwaysInStock,
      }));

      return {
        options,
        hasMore: options.length === 10,
        additional: { page: page + 1 },
      };
    } catch (error) {
      console.error("Error fetching ingredients:", error);
      return {
        options: [],
        hasMore: false,
        additional: { page },
      };
    }
  };

  return (
    <AsyncPaginate
      value={selectedOption}
      placeholder="Add Ingredient..."
      onChange={(option) => {
        setSelectedOption(option);
        onIngredientChange?.(option);
      }}
      loadOptions={loadOptions}
      additional={{ page: 1 }}
      isClearable
      isSearchable
      menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
      styles={{
        menu: (base) => ({ ...base, zIndex: 10 }),
        control: () => ({
          display: "flex",
          borderWidth: "2px",
          borderColor: "var(--gray-200)",
          borderRadius: "5rem",
          padding: "0 6px",
        }),
        placeholder: (base) => ({ ...base, color: "var(--gray-300)" }),
        option: (base, state) => ({
          ...base,
          color: state.isSelected ? "var(--green-300)" : "black",
          backgroundColor: state.isSelected
            ? "var(--green-100)"
            : state.isFocused
            ? "var(--gray-100)"
            : base.backgroundColor,
        }),
      }}
    />
  );
}