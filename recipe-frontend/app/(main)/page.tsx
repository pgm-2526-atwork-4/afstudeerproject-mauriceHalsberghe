"use client";

import RecipeCard from '../components/RecipeCard';
import { useEffect, useState } from "react";

import SearchIcon from '@/public/search.svg'
import HomeStyles from '@/app/styles//pages/home.module.css';

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
  instructions: string;
  imageUrl: string;
  time: number;
  diet?: Diet;
  cuisine?: Cuisine;
  user?: User;
};

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const [search, setSearch] = useState('');

  const [diets, setDiets] = useState<Diet[]>([]);
  const [selectedDiet, setSelectedDiet] = useState(0);
  
  const [cuisines, setCuisines] = useState<Cuisine[]>([]);
  const [selectedCuisine, setSelectedCuisine] = useState(0);

  const [onlyUsers, setOnlyUsers] = useState(false);

  const [time, setTime] = useState(15);
  const displayTime = time === 90 ? "90+" : time;

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

    const fetchDiets = async () => {
      try {
        const res = await fetch('http://localhost:5041/api/diets');
        const data: Diet[] = await res.json();
        setDiets(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchCuisines = async () => {
      try {
        const res = await fetch('http://localhost:5041/api/cuisines');
        const data: Cuisine[] = await res.json();
        setCuisines(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDiets();
    fetchCuisines();
    fetchRecipes();
  }, []);

  if (!mounted) return <p>Loading...</p>;

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesDiet = selectedDiet === 0 || recipe.diet?.id === selectedDiet;
    const matchesCuisine = selectedCuisine === 0 || recipe.cuisine?.id === selectedCuisine;
    const matchesTime = time === 0 || recipe.time === time;
    const matchesTitle = search === '' || recipe.title.toLowerCase().includes(search.toLowerCase());
    const matchesOnlyUsers = onlyUsers === false || recipe.user !== null;
    return matchesDiet && matchesCuisine && matchesTitle && matchesOnlyUsers;// && matchesTime;
  });

  return (
    <main className={HomeStyles.home}>

      <div className={HomeStyles.search}>
        <input
          type='text'
          placeholder='Search Recipes'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

      </div>

      <div className={HomeStyles.filters}>

        <select
          value={selectedDiet}
          onChange={(e) => setSelectedDiet(Number(e.target.value))}
          className={HomeStyles.select}
        >
          <option className={HomeStyles.option} value={0}>All Diets</option>
          {diets.map((diet) => (
            <option key={diet.id} value={diet.id} className={HomeStyles.option}>
              {diet.name}
            </option>
          ))}
        </select>

        <select
          value={selectedCuisine}
          onChange={(e) => setSelectedCuisine(Number(e.target.value))}
          className={HomeStyles.select}
        >
          <option value={0} className={HomeStyles.option}>All Cuisines</option>
          {cuisines.map((cuisine) => (
            <option key={cuisine.id} value={cuisine.id} className={HomeStyles.option}>
              {cuisine.name}
            </option>
          ))}
        </select>

        <div>
          <p>Time</p>
          <input
            type="range"
            min={5}
            max={90}
            step={5}
            value={time}
            onChange={(e) => setTime(Number(e.target.value))}
          />
          <output>{displayTime}</output>
        </div>

        <label>
          Only user recipes
          <input
            type="checkbox"
            checked={onlyUsers}
            onChange={(e) => setOnlyUsers(e.target.checked)}
          />
        </label>

      </div>
      
      {loading ? (
        <p>Loading recipes...</p>
      ) : (
        <ul className={HomeStyles.recipes}>
          {filteredRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </ul>
      )}

    </main>
  );
}
