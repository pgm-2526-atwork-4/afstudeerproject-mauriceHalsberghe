"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";

import DetailStyles from "@/app/styles/pages/recipe-detail.module.css"
import Link from "next/link";
import BackButton from "@/app/components/BackButton";

import RatingStars from "@/app/components/RatingStars";
import RatingModal from "@/app/components/RatingModal";
import { AuthContext } from "@/context/AuthContext";

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

type Ingredient = {
    id: number;
    quantity: number;
    unit: string;
    ingredientName: string;

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
    ingredients: Ingredient[];
    likeCount: number;
    averageRating?: number;
};

export default function RecipeDetail() {
    const [loading, setLoading] = useState(true);
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [showModal, setShowModal] = useState(false);

    const params = useParams();
    const recipeId = Number(params.id);

    const auth = useContext(AuthContext);
    const loggedUserId = auth?.user?.id;

    const fetchRecipe = async () => {
        try {
            const res = await fetch(`http://localhost:5041/api/recipes/${recipeId}`);
            const recipeData: Recipe = await res.json();
            setRecipe(recipeData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecipe();
    }, [recipeId]);

    if (!recipe) {
        return <p>Recipe not found</p>
    }

    return (
        <div className={DetailStyles.page}>
            <div className={DetailStyles.header}>
                <BackButton url="/" absolute={false}/>
                <h1 className={DetailStyles.title}>{recipe.title}</h1>
                { recipe.user ? <Link href={`/users/${recipe.user.username}`} className={DetailStyles.user}>
                        <Image 
                            className={DetailStyles.avatar} 
                            width={64} 
                            height={64} 
                            alt={recipe.user.username}
                            src={recipe.user.avatar ? `http://localhost:5041/uploads/avatars/${recipe.user.avatar}` : '/avatar.svg'} 
                        />
                        <p className={DetailStyles.username}>{recipe.user.username}</p>
                    </Link> : <div></div> }
            </div>
            
            <Image className={DetailStyles.image} width={360} height={200} alt={recipe.title} src={`http://localhost:5041/uploads/recipe-images/${recipe.imageUrl}`}/>
            
            <div className={DetailStyles.detailData}>
                <div onClick={() => setShowModal(true)}>
                    { recipe.averageRating ? 
                    
                        <div className={DetailStyles.ratingAmount}><RatingStars amount={recipe.averageRating}/><p>{recipe.averageRating}</p></div> : 
                        <p className={DetailStyles.rating}>No ratings yet</p>
                    }
                </div>
                <p className={DetailStyles.duration}>{recipe.time} min</p>
            </div>
    
            
            <h2 className={DetailStyles.subtitle}>Ingredients</h2>
            <ul className={DetailStyles.ingredients}>
                {recipe.ingredients.map((ingredient) => (
                    <li className={DetailStyles.ingredient} key={ingredient.id}>
                        {
                            ingredient.quantity &&
                            <p className={DetailStyles.ingredientAmount}>
                                {ingredient.quantity}
                                {ingredient.unit}
                            </p>
                        }
                        <p className={DetailStyles.ingredientName}>
                            {ingredient.ingredientName}
                            </p>

                    </li>
                ))}
            </ul>
            
            <h2 className={DetailStyles.subtitle}>Instructions</h2>
            <ul className={DetailStyles.steps}>
                {recipe.steps.map((step) => (
                    <li className={DetailStyles.step} key={step.id}>
                        <p className={DetailStyles.stepNumber}>{step.stepNumber}</p>
                        <p className={DetailStyles.stepDescription}>{step.description}</p>
                    </li>
                ))}
            </ul>

            {showModal && loggedUserId &&
                <div 
                    className={DetailStyles.modalOverlay} 
                    onClick={() => setShowModal(false)}
                >
                    <div onClick={(e) => e.stopPropagation()}>
                        <RatingModal 
                            userId={loggedUserId} 
                            recipeId={recipeId} 
                            onClose={() => setShowModal(false)}
                            onRated={fetchRecipe}
                        />
                    </div>
                </div>
            }

        </div>
    );
}
