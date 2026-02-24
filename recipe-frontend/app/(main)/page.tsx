"use client";

import RecipeCard from '../components/RecipeCard';
import { useEffect, useState } from "react";

import HomeStyles from '@/app/styles//pages/home.module.css';


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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

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

  if (!mounted) return <p>Loading...</p>;

  return (
    <main className={HomeStyles.home}>
      
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
