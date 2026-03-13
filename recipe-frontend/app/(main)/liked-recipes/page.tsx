"use client";

import { API_URL } from "@/lib/api";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import RecipeCard from "@/app/components/RecipeCard";
import RecipeFilters, {
  RecipeFiltersState,
} from "@/app/components/RecipeFilters";
import HomeStyles from "@/app/styles/pages/home.module.css";
import EmptyView from "@/app/components/EmptyView";
import { Recipe } from "@/types/RecipeTypes";

export default function LikedRecipes() {
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
          `${API_URL}/api/recipes?currentUserId=${loggedUserId}`
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

    const matchesOnlyIngredients = 
      !filters.onlyInStock || recipe.missingIngredientCount === 0;

    return (
      matchesDiet &&
      matchesCuisine &&
      matchesTitle &&
      matchesOnlyUsers
    );
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

  if (!loggedUserId) {
    return <EmptyView title='Not logged in' text="Log in to see your liked recipes" btnText='Log In' btnUrl='/login' icon="profile" />
  }

  return (
    <main className={HomeStyles.home}>
      <RecipeFilters filters={filters} onChange={setFilters} onlyUsersFilter={true} />

      {recipes.length === 0 ?
          <EmptyView title='No Recipes found' text="Start exploring recipes and save the ones you love" btnText="Browse recipes" btnUrl="/" icon="recipe"/>

        :
      


        filteredRecipes.length === 0 ? (
          <EmptyView title="No recipes found" text="No recipes match your search" icon="recipe"/>
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
        )
      }

    </main>
  );
}