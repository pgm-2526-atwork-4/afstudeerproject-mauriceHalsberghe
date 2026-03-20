"use client";

import { API_URL } from "@/lib/api";
import { useContext, useEffect, useRef, useState, useCallback } from "react";
import RecipeCard from '../components/RecipeCard';
import RecipeFilters, { RecipeFiltersState } from "@/app/components/RecipeFilters";
import HomeStyles from '@/app/styles/pages/home.module.css';
import { AuthContext } from '@/context/AuthContext';
import EmptyView from "../components/EmptyView";
import { Recipe } from "@/types/RecipeTypes";
import { usePageSize } from "@/lib/usePageSize";

export default function Home() {
  const PAGE_SIZE = usePageSize();

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

  const [initialLoading, setInitialLoading] = useState(true);

  const [filters, setFilters] = useState<RecipeFiltersState>({
    search: "",
    selectedDiet: 0,
    selectedCuisine: 0,
    selectedDishType: 0,
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
    const pageSize = PAGE_SIZE ?? 6;
    const currentPage = isInitial ? 1 : page;
    
    const params = new URLSearchParams({
      currentUserId: loggedUserId?.toString() ?? "",
      page: currentPage.toString(),
      pageSize: pageSize.toString(),
      search: filters.search,
      sortBy: filters.selectedSort.toString(),
      onlyUsers: filters.onlyUsers.toString(),
      onlyInStock: filters.onlyInStock.toString(),
      filterByDiet: filterByDiet.toString(),
      filterByAllergens: filterByAllergens.toString(),
    });
    if (filters.selectedDiet) params.set("dietId", filters.selectedDiet.toString());
    if (filters.selectedCuisine) params.set("cuisineId", filters.selectedCuisine.toString());
    if (filters.selectedDishType) params.set("dishTypeId", filters.selectedDishType.toString());

    try {
      const res = await fetch(`${API_URL}/api/recipes?${params}`);
      const data = await res.json();

      setRecipes(prev => {
        if (isInitial) return data.recipes;

        const existingIds = new Set(prev.map(r => r.id));
        const uniqueNewRecipes = data.recipes.filter(
          (recipe: Recipe) => !existingIds.has(recipe.id)
        );
        return [...prev, ...uniqueNewRecipes];
      });

      const moreAvailable = (currentPage * pageSize) < data.totalCount;
      setHasMore(moreAvailable);
      setPage(prev => isInitial ? 2 : prev + 1);

    } catch (err) {
    console.error("Failed to fetch recipes:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters, loggedUserId, page, filterByDiet, filterByAllergens]);

  useEffect(() => {
    if (auth?.loading || !prefsLoaded || PAGE_SIZE === null) return;
    setLoading(true);
    fetchRecipes(true).then(() => setInitialLoading(false));
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

  return (
    <main className={HomeStyles.home}>
      <RecipeFilters
        key="recipe-filters"
        filters={filters}
        onChange={setFilters}
        onlyUsersFilter={true}
        userDietId={userDietId}
        filterByDiet={filterByDiet}
      />

      {(initialLoading && recipes.length === 0) || auth?.loading ? (
        <div className={HomeStyles.skeletonGrid}>
          {[...Array(PAGE_SIZE ?? 6)].map((_, i) => (
            <div key={i} className={HomeStyles.skeletonCard}>
              <span className={HomeStyles.skeletonCardInfo}>
                <span></span>
              </span>
            </div>
          ))}
        </div>
      ) : recipes.length === 0 ? (
        <EmptyView title="No recipes found" text="No recipes match your search" icon="recipe" btnUrl="./" btnText="Back" />
      ) : (
        <ul className={HomeStyles.recipes}>
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
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