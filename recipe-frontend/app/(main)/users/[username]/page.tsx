"use client";

import { useParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import RecipeCard from "@/app/components/RecipeCard";
import RecipeFilters, {
  RecipeFiltersState,
} from "@/app/components/RecipeFilters";
import HomeStyles from "@/app/styles/pages/home.module.css";
import EmptyView from "@/app/components/EmptyView";
import { log } from "node:console";
import Image from "next/image";

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
                    fetch(`http://localhost:5041/api/users/${username}/recipes?currentUserId=${loggedUserId ?? ""}`),
                    fetch(`http://localhost:5041/api/users/${username}`),
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
            <div className={HomeStyles.userTitle}>
                <Image
                    className={HomeStyles.avatar}
                    src={profileUser.avatar ? `http://localhost:5041/uploads/avatars/${profileUser.avatar}` : '/avatar.svg'} 
                    alt={`${profileUser.username} avatar`}
                    width={64}
                    height={64}
                    />
                <h1 className={HomeStyles.title}>{profileUser?.username}&apos;s Recipes</h1>
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