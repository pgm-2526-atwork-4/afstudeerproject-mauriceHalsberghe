"use client";

import { API_URL } from "@/lib/api";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import RecipeCard from "@/app/components/RecipeCard";
import RecipeFilters, { RecipeFiltersState } from "@/app/components/RecipeFilters";
import HomeStyles from "@/app/styles/pages/home.module.css";
import EmptyView from "@/app/components/EmptyView";
import { Recipe } from "@/types/RecipeTypes";

const PAGE_SIZE = 9;

export default function LikedRecipes() {
  const auth = useContext(AuthContext);
  const loggedUserId = auth?.user?.id;

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const [userDietId, setUserDietId] = useState<number | null>(null);
  const [filterByDiet, setFilterByDiet] = useState(false);
  const [filterByAllergens, setFilterByAllergens] = useState(false);
  const [prefsLoaded, setPrefsLoaded] = useState(false);

  const [filters, setFilters] = useState<RecipeFiltersState>({
    search: "",
    selectedDiet: 0,
    selectedCuisine: 0,
    time: 15,
    onlyUsers: false,
    onlyInStock: false,
    selectedSort: 3,
  });

  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (auth?.loading) return;

    if (!auth?.user || !auth.token) {
      setPrefsLoaded(true);
      return;
    }

    const fetchPrefs = async () => {
      try {
        const res = await fetch(`${API_URL}/api/users/${auth?.user?.id}/preferences`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        const data = await res.json();
        setFilterByDiet(data.filterByDiet ?? false);
        setFilterByAllergens(data.filterByAllergens ?? false);
        setUserDietId(data.dietId ?? null);
      } catch (err) {
        console.error("Failed to fetch preferences:", err);
      } finally {
        setPrefsLoaded(true);
      }
    };

    fetchPrefs();
  }, [auth?.loading, auth?.user?.id]);

  const fetchRecipes = useCallback(async (isInitial = false) => {
    if (!loggedUserId) return;
    const currentPage = isInitial ? 1 : page;

    const params = new URLSearchParams({
      currentUserId: loggedUserId.toString(),
      page: currentPage.toString(),
      pageSize: PAGE_SIZE.toString(),
      search: filters.search,
      sortBy: filters.selectedSort.toString(),
      onlyUsers: filters.onlyUsers.toString(),
      onlyInStock: filters.onlyInStock.toString(),
      filterByDiet: filterByDiet.toString(),
      filterByAllergens: filterByAllergens.toString(),
      onlyLiked: "true",
    });
    if (filters.selectedDiet) params.set("dietId", filters.selectedDiet.toString());
    if (filters.selectedCuisine) params.set("cuisineId", filters.selectedCuisine.toString());

    try {
      const res = await fetch(`${API_URL}/api/recipes?${params}`);
      const data = await res.json();

      setRecipes(prev => {
        if (isInitial) return data.recipes;
        const existingIds = new Set(prev.map(r => r.id));
        const uniqueNew = data.recipes.filter((r: Recipe) => !existingIds.has(r.id));
        return [...prev, ...uniqueNew];
      });

      const moreAvailable = (currentPage * PAGE_SIZE) < data.totalCount;
      setHasMore(moreAvailable);
      setPage(prev => isInitial ? 2 : prev + 1);
    } catch (err) {
      console.error("Failed to fetch liked recipes:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters, loggedUserId, page, filterByDiet, filterByAllergens]);

  useEffect(() => {
    if (auth?.loading || !prefsLoaded) return;
    
    if (!loggedUserId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchRecipes(true);
  }, [filters, loggedUserId, auth?.loading, prefsLoaded, filterByDiet, filterByAllergens]);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasMore && !loadingMore && !loading) {
        setLoadingMore(true);
        fetchRecipes();
      }
    }, { threshold: 0.1 });

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, fetchRecipes]);

  if (auth?.loading || (loading && recipes.length === 0)) {
    return (
      <main className={HomeStyles.home}>
        <div className={HomeStyles.header}>
          <RecipeFilters
            key="recipe-filters"
            filters={filters}
            onChange={setFilters}
            onlyUsersFilter={true}
            userDietId={userDietId}
            filterByDiet={filterByDiet}
          />
        </div>
        <div className={HomeStyles.main}>
          <div className={HomeStyles.skeletonGrid}>
            {[...Array(3)].map((_, i) => (
              <div key={i} className={HomeStyles.skeletonCard}>
                <span className={HomeStyles.skeletonCardInfo}>
                  <span></span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (!loggedUserId) {
    return (
      <EmptyView
        title="Not logged in"
        text="Log in to see your liked recipes"
        btnText="Log In"
        btnUrl="/login"
        icon="profile"
      />
    );
  }

  return (
    <main className={HomeStyles.home}>
      <div className={HomeStyles.header}>
        <RecipeFilters
          key="recipe-filters"
          filters={filters}
          onChange={setFilters}
          onlyUsersFilter={false}
          userDietId={userDietId}
          filterByDiet={filterByDiet}
        />
      </div>

      {recipes.length === 0 ? (
        <EmptyView
          title="No liked recipes yet"
          text="Start exploring recipes and save the ones you love"
          btnText="Browse recipes"
          btnUrl="/"
          icon="recipe"
        />
      ) : (
        <ul className={HomeStyles.recipes}>
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onUnlike={(id) => setRecipes((prev) => prev.filter((r) => r.id !== id))}
            />
          ))}
        </ul>
      )}

      <div ref={loaderRef}>
        {loadingMore && <p className={HomeStyles.message}>Loading more...</p>}
        {!hasMore && recipes.length > 0 && <p className={HomeStyles.message}>All recipes loaded</p>}
      </div>

    </main>
  );
}