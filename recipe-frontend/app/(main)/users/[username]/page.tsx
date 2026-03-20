"use client";

import { API_URL } from "@/lib/api";

import { useParams } from "next/navigation";
import { useContext, useEffect, useRef, useState, useCallback } from "react";
import { AuthContext } from "@/context/AuthContext";
import RecipeCard from "@/app/components/RecipeCard";
import RecipeFilters, { RecipeFiltersState } from "@/app/components/RecipeFilters";
import EmptyView from "@/app/components/EmptyView";
import Image from "next/image";
import { usePageSize } from "@/lib/usePageSize";

import HomeStyles from "@/app/styles/pages/home.module.css";
import ButtonsStyles from "@/app/styles/components/button.module.css";
import Link from "next/link";
import { Recipe } from "@/types/RecipeTypes";
import { User } from "@/types/UserTypes";

export default function UserRecipesPage() {
    const PAGE_SIZE = usePageSize();

    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [initialLoading, setInitialLoading] = useState(true);

    const [profileUser, setProfileUser] = useState<User | null>(null);
    const [userNotFound, setUserNotFound] = useState(false);

    const [filters, setFilters] = useState<RecipeFiltersState>({
        search: "",
        selectedDiet: 0,
        selectedCuisine: 0,
        selectedDishType: 0,
        time: 15,
        onlyUsers: false,
        onlyInStock: false,
        selectedSort: 1,
    });

    const params = useParams();
    const username = params.username;

    const auth = useContext(AuthContext);
    const loggedUserId = auth?.user?.id;

    const loaderRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (auth?.loading) return;

        const fetchUser = async () => {
            try {
                const res = await fetch(`${API_URL}/api/users/${username}`);
                if (!res.ok) {
                    setUserNotFound(true);
                    return;
                }
                setProfileUser(await res.json());
            } catch (err) {
                console.error(err);
                setUserNotFound(true);
            }
        };

        fetchUser();
    }, [auth?.loading, username]);

    const fetchRecipes = useCallback(async (isInitial = false) => {
        const pageSize = PAGE_SIZE ?? 6;
        const currentPage = isInitial ? 1 : page;

        const params = new URLSearchParams({
            currentUserId: loggedUserId?.toString() ?? "",
            page: currentPage.toString(),
            pageSize: pageSize.toString(),
            search: filters.search,
            sortBy: filters.selectedSort.toString(),
            onlyUsers: "true",
        });
        if (filters.selectedDiet) params.set("dietId", filters.selectedDiet.toString());
        if (filters.selectedCuisine) params.set("cuisineId", filters.selectedCuisine.toString());
        if (filters.selectedDishType) params.set("dishTypeId", filters.selectedDishType.toString());

        try {
            const res = await fetch(`${API_URL}/api/users/${username}/recipes?${params}`);
            const data = await res.json();

            const incoming: Recipe[] = Array.isArray(data) ? data : data.recipes ?? [];
            const totalCount: number = Array.isArray(data) ? Infinity : data.totalCount ?? incoming.length;

            setRecipes(prev => {
                if (isInitial) return incoming;
                const existingIds = new Set(prev.map(r => r.id));
                return [...prev, ...incoming.filter((r: Recipe) => !existingIds.has(r.id))];
            });

            const moreAvailable = (currentPage * pageSize) < totalCount;
            setHasMore(moreAvailable);
            setPage(isInitial ? 2 : currentPage + 1);
        } catch (err) {
            console.error("Failed to fetch recipes:", err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [filters, loggedUserId, page, username, PAGE_SIZE]);

    useEffect(() => {
        if (auth?.loading || PAGE_SIZE === null) return;
        setLoading(true);
        setPage(1);
        fetchRecipes(true).then(() => setInitialLoading(false));
    }, [filters, loggedUserId, auth?.loading, PAGE_SIZE]);

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

    if (userNotFound) return <p>User not found</p>;

    return (
        <main className={HomeStyles.home}>
            <div className={HomeStyles.userHeader}>
                <div className={HomeStyles.userTitle}>
                    <Image
                        className={HomeStyles.avatar}
                        src={profileUser?.avatar ? `${API_URL}/uploads/avatars/${profileUser.avatar}` : "/avatar.svg"}
                        alt={profileUser ? `${profileUser.username} avatar` : "avatar"}
                        width={64}
                        height={64}
                    />
                    <h1 className={HomeStyles.title}>
                        {profileUser ? `${profileUser.username}'s Recipes` : "Loading..."}
                    </h1>
                </div>

                {profileUser && loggedUserId === profileUser.id && (
                    <Link href="/recipes/add" className={ButtonsStyles.button}>
                        Create recipe
                    </Link>
                )}
            </div>

            <RecipeFilters
                key="user-recipe-filters"
                filters={filters}
                onChange={setFilters}
                onlyUsersFilter={false}
            />

            {(initialLoading && recipes.length === 0) || auth?.loading ? (
                <div className={HomeStyles.skeletonGridUser}>
                    {[...Array(PAGE_SIZE ?? 6)].map((_, i) => (
                        <div key={i} className={HomeStyles.skeletonCard}>
                            <span className={HomeStyles.skeletonCardInfo}>
                                <span></span>
                            </span>
                        </div>
                    ))}
                </div>
            ) : recipes.length === 0 ? (
                <EmptyView
                    title="No recipes found"
                    text="This user hasn't posted any recipes yet"
                    icon="recipe"
                    btnUrl="./"
                    btnText="Back"
                />
            ) : (
                <ul className={HomeStyles.UserRecipes}>
                    {recipes.map((recipe) => (
                        <RecipeCard
                            key={recipe.id}
                            recipe={recipe}
                            onUnlike={(id) =>
                                setRecipes(prev =>
                                    prev.map(r =>
                                        r.id === id
                                            ? { ...r, isLikedByCurrentUser: false, likeCount: r.likeCount - 1 }
                                            : r
                                    )
                                )
                            }
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