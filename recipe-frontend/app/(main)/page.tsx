"use client";

import { API_URL } from "@/lib/api";

import { useContext, useEffect, useState } from "react";

import RecipeCard from '../components/RecipeCard';
import RecipeFilters, { RecipeFiltersState } from "../components/RecipeFilters";

import HomeStyles from '@/app/styles//pages/home.module.css';
import { AuthContext } from '@/context/AuthContext';
import EmptyView from "../components/EmptyView";

type Diet = {
  id: number;
  name: string;
};

type Cuisine = {
  id: number;
  name: string;
};

type User = {
  id: number;
  username: string;
  avatar: string;
};

type Recipe = {
  id: number;
  title: string;
  imageUrl: string;
  time: number;
  likeCount: number;
  isLikedByCurrentUser: boolean;
  averageRating: number;
  diet?: Diet;
  cuisine?: Cuisine;
  user?: User;
  missingIngredientCount?: number | null;
};

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const [filters, setFilters] = useState<RecipeFiltersState>({
    search: "",
    selectedDiet: 0,
    selectedCuisine: 0,
    time: 15,
    onlyUsers: false,
    onlyInStock: false,
    selectedSort: 1,
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
    setMounted(true);
  }, []);

  useEffect(() => {
    if (auth?.loading) return;
    fetchRecipes();
  }, [loggedUserId, auth?.loading]);

  if (!mounted) return <p>Loading...</p>;

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

  return (
    <main className={HomeStyles.home}>
      <RecipeFilters filters={filters} onChange={setFilters} onlyUsersFilter={true} />

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