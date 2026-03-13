"use client";

import { API_URL } from "@/lib/api";

import { useContext, useEffect, useState } from "react";

import RecipeCard from '../components/RecipeCard';
import RecipeFilters, { RecipeFiltersState } from "../components/RecipeFilters";

import HomeStyles from '@/app/styles/pages/home.module.css';
import { AuthContext } from '@/context/AuthContext';
import EmptyView from "../components/EmptyView";
import { Recipe } from "@/types/RecipeTypes";

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<RecipeFiltersState>({
    search: "",
    selectedDiet: 0,
    selectedCuisine: 0,
    time: 15,
    onlyUsers: false,
    onlyInStock: false,
    selectedSort: 3,
  });

  const auth = useContext(AuthContext);
  const loggedUserId = auth?.user?.id;

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/api/recipes?currentUserId=${loggedUserId ?? ""}`
      );
      const data: Recipe[] = await res.json();
      setRecipes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (auth?.loading) return;
    fetchRecipes();
  }, [loggedUserId, auth?.loading]);

  const filteredRecipes = recipes
    .filter((recipe) => {
      const matchesDiet =
        filters.selectedDiet === 0 ||
        recipe.diet?.id === filters.selectedDiet;

      const matchesCuisine =
        filters.selectedCuisine === 0 ||
        recipe.cuisine?.id === filters.selectedCuisine;

      const matchesTitle =
        filters.search === "" ||
        recipe.title.toLowerCase().includes(filters.search.toLowerCase());

      const matchesOnlyUsers =
        !filters.onlyUsers || recipe.user !== null;

      const matchesOnlyIngredients = 
        !filters.onlyInStock || recipe.missingIngredientCount === 0;

      return (
        matchesDiet &&
        matchesCuisine &&
        matchesTitle &&
        matchesOnlyUsers &&
        matchesOnlyIngredients
      );
    })
    .sort((a, b) => {
      if (filters.selectedSort === 1) {
        return (b.averageRating ?? 0) - (a.averageRating ?? 0);
      }

      else if (filters.selectedSort === 2) {
        return a.title.localeCompare(b.title);
      }

      else if (filters.selectedSort === 3) {
      const missingA = a.missingIngredientCount ?? Infinity;
      const missingB = b.missingIngredientCount ?? Infinity;
      return missingA - missingB;
    }

      return 0;
    });

  if (auth?.loading || loading) {
    return <main className={HomeStyles.home}>
        <div className={HomeStyles.header}>
        </div>
        <div className={HomeStyles.main}>
            {[...Array(3)].map((_, i) => (
                <div key={i} className={HomeStyles.skeletonCard}>
                  <span className={HomeStyles.skeletonCardInfo}>
                    <span></span>
                  </span>
                </div>
            ))}
        </div>
    </main>;
  }

  return (
    <main className={HomeStyles.home}>
      <div className={HomeStyles.header}>
        <RecipeFilters filters={filters} onChange={setFilters} onlyUsersFilter={true} />
      </div>

      {loading ? (
        <p>Loading recipes...</p>
      ) : (
        
        filteredRecipes.length === 0 ? 
        <EmptyView title="No recipes found" text="No recipes match your search" icon="recipe" btnUrl="./" btnText="Back"/>
        :
        <ul className={HomeStyles.recipes}>
          {filteredRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </ul>
        
      )}
    </main>
  );
}