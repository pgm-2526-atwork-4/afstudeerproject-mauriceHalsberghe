"use client";

import { useEffect, useState } from "react";
import filtersStyles from "@/app/styles/components/recipefilers.module.css";

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
  selectedSort: number;
};

type Props = {
  filters: RecipeFiltersState;
  onlyUsersFilter: boolean;
  onChange: (filters: RecipeFiltersState) => void;
};

export default function RecipeFilters({ filters, onChange, onlyUsersFilter }: Props) {
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
      <div className={filtersStyles.search}>
        <input
          type="text"
          placeholder="Search Recipes"
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
        />
      </div>

      <div className={filtersStyles.filterWrapper}>

        <div className={filtersStyles.filters}>
          <select
            value={filters.selectedDiet}
            onChange={(e) => update({ selectedDiet: Number(e.target.value) })}
            className={filtersStyles.select}
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
            className={filtersStyles.select}
          >
            <option value={0}>All Cuisines</option>
            {cuisines.map((cuisine) => (
              <option key={cuisine.id} value={cuisine.id}>
                {cuisine.name}
              </option>
            ))}
          </select>

          {/* <div>
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
          </div> */}
          
          {onlyUsersFilter && 

            <div className={filtersStyles.checkbox}>
              <input
                type="checkbox"
                id="usersCheck"
                className={filtersStyles.checkboxInput}
                checked={filters.onlyUsers}
                onChange={(e) => update({ onlyUsers: e.target.checked })}
              />

              <label className={filtersStyles.checkboxLabel} htmlFor="usersCheck" >
                User recipes
              </label>
            </div>
          }

          <select
            onChange={(e) => update({ selectedSort: Number(e.target.value) })}
            className={filtersStyles.select}
          >
            <option value={1}>Sort by Rating</option>
            <option value={2}>Sort from A-Z</option>
          </select>

        </div>
      </div>

    </>
  );
}