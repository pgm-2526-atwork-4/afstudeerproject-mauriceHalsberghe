"use client";

import { API_URL } from "@/lib/api";
import { useContext, useEffect, useRef, useState, useCallback } from "react";
import RecipeCard from '../components/RecipeCard';
import RecipeFilters, { RecipeFiltersState } from "../components/RecipeFilters";
import HomeStyles from '@/app/styles/pages/home.module.css';
import { AuthContext } from '@/context/AuthContext';
import EmptyView from "../components/EmptyView";
import { Recipe } from "@/types/RecipeTypes";

const PAGE_SIZE = 9;

export default function Home() {
  const auth = useContext(AuthContext);
  const loggedUserId = auth?.user?.id;

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

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

  const fetchRecipes = useCallback(async (isInitial = false) => {
    const currentPage = isInitial ? 1 : page;
    
    const params = new URLSearchParams({
      currentUserId: loggedUserId?.toString() ?? "",
      page: currentPage.toString(),
      pageSize: PAGE_SIZE.toString(),
      search: filters.search,
      sortBy: filters.selectedSort.toString(),
      onlyUsers: filters.onlyUsers.toString(),
      onlyInStock: filters.onlyInStock.toString(),
    });
    if (filters.selectedDiet) params.set("dietId", filters.selectedDiet.toString());
    if (filters.selectedCuisine) params.set("cuisineId", filters.selectedCuisine.toString());

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
      const moreAvailable = (currentPage * PAGE_SIZE) < data.totalCount;
      setHasMore(moreAvailable);

      setPage(prev => isInitial ? 2 : prev + 1);

    } catch (err) {
    console.error("Failed to fetch recipes:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters, loggedUserId, page]);

  useEffect(() => {
    if (auth?.loading) return;
    setLoading(true);
    fetchRecipes(true);
  }, [filters, loggedUserId, auth?.loading]);

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
        <div className={HomeStyles.header} />
        <div className={HomeStyles.main}>
          <div className={HomeStyles.skeletonGrid}>
            {[...Array(5)].map((_, i) => (
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

  return (
    <main className={HomeStyles.home}>
      <div className={HomeStyles.header}>
        <RecipeFilters filters={filters} onChange={setFilters} onlyUsersFilter={true} />
      </div>

      {recipes.length === 0 ? (
        <EmptyView title="No recipes found" text="No recipes match your search" icon="recipe" btnUrl="./" btnText="Back" />
      ) : (
        <ul className={HomeStyles.recipes}>
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </ul>
      )}

      <div ref={loaderRef}>

      {loadingMore && <p>Loading more...</p>}

      {!hasMore && recipes.length > 0 && (
        <p>All recipes loaded</p>
      )}
        
      </div>
    </main>
  );
}