"use client";

import { API_URL } from "@/lib/api";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useParams, useRouter } from "next/navigation";
import RecipeForm, { RecipeFormValues } from "@/app/components/RecipeForm";
import AddRecipeStyles from "@/app/styles/pages/addrecipe.module.css";

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
    isInInventory?: boolean;
};

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

export default function EditRecipe() {
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [units, setUnits] = useState<{ id: number; name: string; shortName: string }[]>([]);

    const auth = useContext(AuthContext);
    const loggedUserId = auth?.user?.id;
    const params = useParams();
    const recipeId = Number(params.id);
    const router = useRouter();

    useEffect(() => {
    const fetchData = async () => {
        try {
            const recipeUrl = loggedUserId
                ? `${API_URL}/api/recipes/${recipeId}?currentUserId=${loggedUserId}`
                : `${API_URL}/api/recipes/${recipeId}`;

            const [recipeRes, unitsRes] = await Promise.all([
                fetch(recipeUrl),
                fetch(`${API_URL}/api/QuantityUnits`)
            ]);

            const recipeData = await recipeRes.json();
            const unitsData = await unitsRes.json();

            setUnits(unitsData);
            setRecipe(recipeData);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    fetchData();
}, [recipeId, loggedUserId]);

    if (!recipe) {
        return 
    }

    if (recipe?.user?.id !== loggedUserId) return <div>Can&apos;t edit this recipe</div>;


    const initialValues: RecipeFormValues = {
        title: recipe.title,
        time: String(recipe.time ?? ""),
        dietId: recipe.diet?.id,
        cuisineId: recipe.cuisine?.id,
        imageUrl: recipe.imageUrl ?? "/recipe.jpg",
        steps: recipe.steps
            .sort((a, b) => a.stepNumber - b.stepNumber)
            .map((s) => ({ id: s.id, description: s.description })),
        ingredients: recipe.ingredients.map((ing, index) => {
            const unit = units.find(
                u => u.shortName.toLowerCase() === ing.unit?.toLowerCase()
            );

            return {
                id: index,
                ingredient: {
                    value: ing.id,
                    label: ing.ingredientName,
                    alwaysInStock: false,
                },
                quantity: ing.quantity,
                unitId: unit?.id
            };
        }),
    };

    const handleSubmit = async (values: RecipeFormValues, pendingImageFile: File | null) => {
        setError("");

        const payload = {
            title: values.title,
            time: values.time ? parseInt(values.time) : null,
            dietId: values.dietId ?? null,
            cuisineId: values.cuisineId ?? null,
            steps: values.steps
                .filter((s) => s.description.trim() !== "")
                .map((s, index) => ({ stepNumber: index + 1, description: s.description })),
            recipeIngredients: values.ingredients
                .filter((i) => i.ingredient !== null)
                .map((i) => ({
                    ingredientId: i.ingredient!.value,
                    quantity: i.ingredient!.alwaysInStock ? null : (i.quantity ?? null),
                    quantityUnitId: i.ingredient!.alwaysInStock ? null : (i.unitId ?? null),
                })),
            imageUrl: values.imageUrl ?? null,
        };

        try {
            const res = await fetch(`${API_URL}/api/Recipes/${recipeId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${auth?.token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) { setError("Failed to update recipe."); return; }

            if (pendingImageFile) {
                const formData = new FormData();
                formData.append("file", pendingImageFile);
                await fetch(`${API_URL}/api/Recipes/${recipeId}/image`, { method: "POST", body: formData });
            }

            const slug = values.title.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
            router.push(`/recipes/${recipeId}/${slug}`);
        } catch (err) {
            console.error(err);
            setError("Something went wrong.");
        }
    };

    return (
        <main className={AddRecipeStyles.page}>
            <h1 className={AddRecipeStyles.title}>Edit recipe</h1>
            { loading ? <p>Loading...</p> : 
                <RecipeForm
                    key={recipe.id}
                    initialValues={initialValues}
                    onSubmit={handleSubmit}
                    submitLabel="Update Recipe"
                    error={error}
                />
            }
        </main>
    );
}