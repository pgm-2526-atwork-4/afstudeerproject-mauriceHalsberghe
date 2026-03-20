"use client";

import { API_URL } from "@/lib/api";

import { useEffect, useState } from "react";
import filtersStyles from "@/app/styles/components/recipefilers.module.css";
import ButtonStyles from "@/app/styles/components/button.module.css";

import { Cuisine, Diet } from "@/types/RecipeTypes";

import CrossIcon from "@/public/cross.svg";

export type RecipeFiltersState = {
  search: string;
  selectedDiet: number;
  selectedCuisine: number;
  time: number;
  onlyUsers: boolean;
  onlyInStock: boolean;
  selectedSort: number;
};

type Props = {
  filters: RecipeFiltersState;
  onlyUsersFilter: boolean;
  onChange: (filters: RecipeFiltersState) => void;
  userDietId?: number | null;
  filterByDiet?: boolean;   
};

export default function RecipeFilters({ filters, onChange, onlyUsersFilter, userDietId, filterByDiet }: Props) {
  const [diets, setDiets] = useState<Diet[]>([]);
  const [cuisines, setCuisines] = useState<Cuisine[]>([]);

  const displayTime = filters.time === 90 ? "90+" : filters.time;

  const [scrolled, setScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectOpen, setSelectOpen] = useState(false);

  const filtersVisible = !scrolled || searchFocused || selectOpen;

  const defaultFilters: RecipeFiltersState = {
    search: "",
    selectedDiet: 0,
    selectedCuisine: 0,
    time: 90,
    onlyUsers: false,
    onlyInStock: false,
    selectedSort: 3,
  };

  const isAnyFilterActive =
    filters.search !== "" ||
    filters.selectedDiet !== 0 ||
    filters.selectedCuisine !== 0 ||
    filters.onlyInStock ||
    filters.onlyUsers ||
    filters.selectedSort !== 3;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
      if (window.scrollY < 40) setSearchFocused(false);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [dietRes, cuisineRes] = await Promise.all([
          fetch(`${API_URL}/api/diets`),
          fetch(`${API_URL}/api/cuisines`),
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
    <div className={filtersStyles.header}>
      <div className={`${filtersStyles.search} ${scrolled ? filtersStyles.searchScrolled : ""} ${filtersVisible ? filtersStyles.filtersVisible : ""}`}>
        <input
          type="text"
          placeholder="Search Recipes"
          value={filters.search}
          onChange={(e) => {
            update({ search: e.target.value })
            setSearchFocused(true)
          }}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
        <CrossIcon
          className={`${filtersStyles.cross} ${filters.search ? filtersStyles.crossActive : ""}`}
          onClick={() => filters.search && update({ search: "" })}
        />
      </div>

      <div
        className={`${filtersStyles.filterWrapper} ${!filtersVisible && filtersStyles.filtersHidden}`}
        onMouseDown={(e) => {
          if ((e.target as HTMLElement).tagName !== "SELECT") {
            e.preventDefault();
          }
        }}
      >

        <div className={filtersStyles.filters}>

          {!(filterByDiet && userDietId) && (
            <select
              value={filters.selectedDiet}
              onChange={(e) => update({ selectedDiet: Number(e.target.value) })}
              className={filtersStyles.select}
              onMouseDown={() => setSelectOpen(true)}
              onBlur={() => setSelectOpen(false)}
            >
              <option value={0}>All Diets</option>
              {diets.map((diet) => (
                <option key={diet.id} value={diet.id}>
                  {diet.name}
                </option>
              ))}
            </select>
          )}

          <select
            value={filters.selectedCuisine}
            onChange={(e) => update({ selectedCuisine: Number(e.target.value) })}
            className={filtersStyles.select}
            onMouseDown={() => setSelectOpen(true)}
            onBlur={() => setSelectOpen(false)}
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

          <div className={filtersStyles.checkbox}>
            <input
              type="checkbox"
              id="ingredientsCheck"
              className={filtersStyles.checkboxInput}
              checked={filters.onlyInStock}
              onChange={(e) => update({ onlyInStock: e.target.checked })}
            />

            <label className={filtersStyles.checkboxLabel} htmlFor="ingredientsCheck" >
              In stock
            </label>
          </div>
          
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
            value={filters.selectedSort}
            onChange={(e) => update({ selectedSort: Number(e.target.value) })}
            className={filtersStyles.select}
            onMouseDown={() => setSelectOpen(true)}
            onBlur={() => setSelectOpen(false)}
          >
            <option value={3}>Available ingredients</option>
            <option value={1}>Sort by Rating</option>
            <option value={2}>Sort from A-Z</option>
          </select>

          {isAnyFilterActive && (
            <button
              className={ButtonStyles.smallButton}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onChange(defaultFilters)}
            >
              Clear
            </button>
          )}

        </div>
      </div>
    </div>
  );
}