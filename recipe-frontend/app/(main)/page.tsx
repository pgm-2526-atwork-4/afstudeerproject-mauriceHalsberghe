"use client";

import RecipeCard from '../components/RecipeCard';
import LogoutButton from "../components/LogoutButton";
import { useContext, useEffect, useState } from "react";

import HomeStyles from '@/app/styles//pages/home.module.css';
import { AuthContext } from '@/context/AuthContext';
import Link from 'next/link';


type Recipe = {
  id: number;
  title: string;
  instructions: string;
  imageUrl: string;
  time: number;
};

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
  const fetchRecipes = async () => {
    try {
      const res = await fetch('http://localhost:5041/api/recipes');
      const data: Recipe[] = await res.json();
      setRecipes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  fetchRecipes();
}, []);

  const auth = useContext(AuthContext);

  return (
    <main className={HomeStyles.home}>
      
      {auth?.user ? (
        <div>
          <p>Logged in as {auth.user.username}</p>
          <LogoutButton />
        </div>
      ) : (
        <Link href="./login">Login</Link>
      )}

      <h1>Recipes</h1>
      <ul className={HomeStyles.recipes}>
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
          />

        ))}
      </ul>
    </main>
  );
}
