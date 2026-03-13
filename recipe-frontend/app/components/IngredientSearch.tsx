"use client";

import { API_URL } from "@/lib/api";

import { useState } from "react";
import { AsyncPaginate, LoadOptions } from "react-select-async-paginate";
import { GroupBase } from "react-select";
import { Ingredient } from "@/types/IngredientTypes";

export type IngredientOption = {
  value: number;
  label: string;
  alwaysInStock: boolean;
};

type Props = {
  value: IngredientOption | null;
  onIngredientChange?: (ingredient: IngredientOption | null) => void;
  placeholder?: string;
};

export default function IngredientSearch({ value, onIngredientChange, placeholder }: Props) {

  const loadOptions: LoadOptions<
    IngredientOption,
    GroupBase<IngredientOption>,
    { page: number }
  > = async (search, loadedOptions, additional = { page: 1 }) => {

    const page = additional.page;
    try {
      const res = await fetch(
        `${API_URL}/api/ingredients?search=${encodeURIComponent(search)}&page=${page}&pageSize=10`
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
      value={value}
      placeholder={placeholder || "Add Ingredient..." }
      onChange={(option) => {
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