"use client";

import { API_URL } from "@/lib/api";

import { useParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import RecipeCard from "@/app/components/RecipeCard";
import RecipeFilters, { RecipeFiltersState } from "@/app/components/RecipeFilters";
import EmptyView from "@/app/components/EmptyView";
import Image from "next/image";

import HomeStyles from "@/app/styles/pages/home.module.css";
import ButtonsStyles from "@/app/styles/components/button.module.css"
import Link from "next/link";
import { Recipe } from "@/types/RecipeTypes";
import { User } from "@/types/UserTypes";

export default function Preferences() {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);

    const [profileUser, setProfileUser] = useState<User>();

    const [filters, setFilters] = useState<RecipeFiltersState>({
        search: "",
        selectedDiet: 0,
        selectedCuisine: 0,
        time: 15,
        onlyUsers: false,
        onlyInStock: false,
        selectedSort: 1
    });

    const params = useParams();
    const username = params.username;

    const auth = useContext(AuthContext);
    const loggedUserId = auth?.user?.id;

    useEffect(() => {
        if (auth?.loading) return;

        const fetchData = async () => {
            try {
                const [recipesRes, userRes] = await Promise.all([
                    fetch(`${API_URL}/api/users/${username}/recipes?currentUserId=${loggedUserId ?? ""}`),
                    fetch(`${API_URL}/api/users/${username}`),
                ]);

                setRecipes(await recipesRes.json());
                setProfileUser(await userRes.json());

                setLoading(false);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();        
    
    }, [loggedUserId, auth?.loading, username]);

    if (auth?.loading || loading) return <p>Loading ...</p>;

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

    if (!profileUser) {
        return <p>User not found</p>
    }

    return (
        <main className={HomeStyles.home}>

            <div className={HomeStyles.header}>
                <div className={HomeStyles.userTitle}>
                    <Image
                        className={HomeStyles.avatar}
                        src={profileUser.avatar ? `${API_URL}/uploads/avatars/${profileUser.avatar}` : '/avatar.svg'} 
                        alt={`${profileUser.username} avatar`}
                        width={64}
                        height={64}
                        />
                    <h1 className={HomeStyles.title}>{profileUser?.username}&apos;s Recipes</h1>


                </div>

                {loggedUserId === profileUser.id &&
                    <Link href={'/recipes/add'} className={ButtonsStyles.button}>Create recipe</Link>
                }
            </div>


            <RecipeFilters filters={filters} onChange={setFilters} onlyUsersFilter={false} />

            {filteredRecipes.length === 0 ? (
                <EmptyView title='Not Recipes found' icon="recipe"/>
            ) : (
                <ul className={HomeStyles.recipes}>
                    {filteredRecipes.map((recipe) => (
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
        </main>
    );
    
}