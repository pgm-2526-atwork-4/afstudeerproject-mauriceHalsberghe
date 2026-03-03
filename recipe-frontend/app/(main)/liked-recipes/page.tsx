"use client";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import RecipeCard from "@/app/components/RecipeCard";
import RecipeFilters, {
  RecipeFiltersState,
} from "@/app/components/RecipeFilters";
import HomeStyles from "@/app/styles/pages/home.module.css";
import EmptyView from "@/app/components/EmptyView";

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

export default function LikedRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<RecipeFiltersState>({
    search: "",
    selectedDiet: 0,
    selectedCuisine: 0,
    time: 15,
    onlyUsers: false,
  });

  const auth = useContext(AuthContext);
  const loggedUserId = auth?.user?.id;

  useEffect(() => {
    if (auth?.loading) return;

    if (!loggedUserId) {
      setLoading(false);
      return;
    }

    const fetchLikedRecipes = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:5041/api/recipes?currentUserId=${loggedUserId}`
        );
        const data: Recipe[] = await res.json();

        const onlyLiked = data.filter((r) => r.isLikedByCurrentUser);
        setRecipes(onlyLiked);
      } catch (err) {
        console.error("Failed to fetch liked recipes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLikedRecipes();
  }, [loggedUserId, auth?.loading]);

  if (auth?.loading || loading) return <p>Loading your favorites...</p>;

  if (!loggedUserId) {
    return <EmptyView title='Not logged in' text="Log in to see your liked recipes" btnText='Log In' btnUrl='/login' icon="profile" />
  }

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

      {filteredRecipes.length === 0 ? (
        <EmptyView title='Not Recipes found' icon="recipe"/>
      ) : (
        <ul className={HomeStyles.recipes}>
            {filteredRecipes.map((recipe) => (
                <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onUnlike={(id) =>
                    setRecipes((prev) => prev.filter((r) => r.id !== id))
                }
                />
            ))}
        </ul>
      )}
    </main>
  );
}