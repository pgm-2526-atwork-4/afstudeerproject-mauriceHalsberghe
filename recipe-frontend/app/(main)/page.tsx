"use client";
import { useContext, useEffect, useState } from "react";

import RecipeCard from '../components/RecipeCard';
import RecipeFilters, { RecipeFiltersState } from "../components/RecipeFilters";

import HomeStyles from '@/app/styles//pages/home.module.css';
import { AuthContext } from '@/context/AuthContext';

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
  diet?: Diet;
  cuisine?: Cuisine;
  user?: User;
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
  });

  const auth = useContext(AuthContext);
  const loggedUserId = auth?.user?.id;

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5041/api/recipes?currentUserId=${loggedUserId ?? ""}`
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

  const filteredRecipes = recipes.filter((recipe) => {
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

    return (
      matchesDiet &&
      matchesCuisine &&
      matchesTitle &&
      matchesOnlyUsers
    );
  });

  return (
    <main className={HomeStyles.home}>
      <RecipeFilters filters={filters} onChange={setFilters} onlyUsersFilter={true} />

      {loading ? (
        <p>Loading recipes...</p>
      ) : (
        <ul className={HomeStyles.recipes}>
          {filteredRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </ul>
      )}
    </main>
  );
}