"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import DetailStyles from "@/app/styles/pages/recipe-detail.module.css"

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

type Step = {
    id: number;
    stepNumber: number;
    description: string;
}

type RecipeIngredient = {
    id: number;
    quantity: number;
    quantityUnit?: QuantityUnit;
    ingredient: Ingredient;
}

type QuantityUnit = {
    id: number;
    name: string;
    shortName: string;
}

type Ingredient = {
    id: number;
    name: string;
}

type Recipe = {
    id: number;
    title: string;
    imageUrl: string;
    time: number;
    diet?: Diet;
    cuisine?: Cuisine;
    user?: User;
    steps: Step[];
    recipeIngredients: RecipeIngredient[];
};

export default function RecipeDetail() {
    const [loading, setLoading] = useState(true);
    const [recipe, setRecipe] = useState<Recipe | null>(null);

    const params = useParams();
    const id = params.id;

    useEffect(() => {
        const fetchRecipe = async () => {
        try {
            const res = await fetch(`http://localhost:5041/api/recipes/${id}`);
            const recipeData: Recipe = await res.json();
            setRecipe(recipeData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
        };
        fetchRecipe();
    }, []);

    if (!recipe) {
        return <p>Recipe not found</p>
    }

    return (
        <div className={DetailStyles.page}>
            <div className={DetailStyles.header}>
                <h1 className={DetailStyles.title}>{recipe.title}</h1>
                {
                    recipe.user &&
                    <div className={DetailStyles.user}>
                        <Image 
                            className={DetailStyles.avatar} 
                            width={24} 
                            height={24} 
                            alt={recipe.user.username}
                            src={recipe.user.avatar ? `http://localhost:5041/uploads/avatars/${recipe.user.avatar}` : '/avatar.svg'} 
                        />
                        <p className={DetailStyles.username}>{recipe.user.username}</p>
                    </div>
                }
            </div>
            
            <Image className={DetailStyles.image} width={360} height={200} alt={recipe.title} src={`http://localhost:5041/uploads/recipe-images/${recipe.imageUrl}`}/>
            
            <p className={DetailStyles.duration}>{recipe.time} min</p>
            
            <h2 className={DetailStyles.subtitle}>Ingredients</h2>
            <ul className={DetailStyles.ingredients}>
                {recipe.recipeIngredients.map((recipeIngredient) => (
                    <li className={DetailStyles.ingredient} key={recipeIngredient.id}>
                        {
                            recipeIngredient.quantity &&
                            <p className={DetailStyles.ingredientAmount}>
                                {recipeIngredient.quantity}
                                {recipeIngredient.quantityUnit?.shortName}
                            </p>
                        }
                        <p className={DetailStyles.ingredientName}>
                            {recipeIngredient.ingredient.name}
                            </p>
                    </li>
                ))}
            </ul>
            
            <h2 className={DetailStyles.subtitle}>Preparation</h2>
            <ul className={DetailStyles.steps}>
                {recipe.steps.map((step) => (
                    <li className={DetailStyles.step} key={step.id}>
                        <p className={DetailStyles.stepNumber}>{step.stepNumber}</p>
                        <p className={DetailStyles.stepDescription}>{step.description}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}
