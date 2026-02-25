"use client";

import { useEffect, useState } from "react";
import styles from "@/app/styles/pages/home.module.css";

type Diet = {
  id: number;
  name: string;
};

type Cuisine = {
  id: number;
  name: string;
};

export type RecipeFiltersState = {
  search: string;
  selectedDiet: number;
  selectedCuisine: number;
  time: number;
  onlyUsers: boolean;
};

type Props = {
  filters: RecipeFiltersState;
  onChange: (filters: RecipeFiltersState) => void;
};

export default function RecipeFilters({ filters, onChange }: Props) {
  const [diets, setDiets] = useState<Diet[]>([]);
  const [cuisines, setCuisines] = useState<Cuisine[]>([]);

  const displayTime = filters.time === 90 ? "90+" : filters.time;

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [dietRes, cuisineRes] = await Promise.all([
          fetch("http://localhost:5041/api/diets"),
          fetch("http://localhost:5041/api/cuisines"),
        ]);

        setDiets(await dietRes.json());
        setCuisines(await cuisineRes.json());
      } catch (err) {
        console.error(err);
      }
    };

    fetchMetadata();
  }, []);

  const update = (newValues: Partial<RecipeFiltersState>) => {
    onChange({ ...filters, ...newValues });
  };

  return (
    <>
      <div className={styles.search}>
        <input
          type="text"
          placeholder="Search Recipes"
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
        />
      </div>

      <div className={styles.filters}>
        <select
          value={filters.selectedDiet}
          onChange={(e) => update({ selectedDiet: Number(e.target.value) })}
          className={styles.select}
        >
          <option value={0}>All Diets</option>
          {diets.map((diet) => (
            <option key={diet.id} value={diet.id}>
              {diet.name}
            </option>
          ))}
        </select>

        <select
          value={filters.selectedCuisine}
          onChange={(e) => update({ selectedCuisine: Number(e.target.value) })}
          className={styles.select}
        >
          <option value={0}>All Cuisines</option>
          {cuisines.map((cuisine) => (
            <option key={cuisine.id} value={cuisine.id}>
              {cuisine.name}
            </option>
          ))}
        </select>

        <div>
          <p>Time</p>
          <input
            type="range"
            min={5}
            max={90}
            step={5}
            value={filters.time}
            onChange={(e) => update({ time: Number(e.target.value) })}
          />
          <output>{displayTime}</output>
        </div>

        <label>
          Only user recipes
          <input
            type="checkbox"
            checked={filters.onlyUsers}
            onChange={(e) => update({ onlyUsers: e.target.checked })}
          />
        </label>
      </div>
    </>
  );
}