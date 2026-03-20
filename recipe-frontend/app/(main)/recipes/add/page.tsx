"use client";

import { API_URL } from "@/lib/api";

import { useContext, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

import RecipeForm, { RecipeFormValues } from "@/app/components/RecipeForm";
import AddRecipeStyles from "@/app/styles/pages/addrecipe.module.css";
import EmptyView from "@/app/components/EmptyView";
import { slugifyTitle } from "@/lib/slugifyTitle";

export default function AddRecipe() {
    const auth = useContext(AuthContext);
    const loggedUserId = auth?.user?.id;
    const router = useRouter();
    const [error, setError] = useState("");

    const handleSubmit = async (values: RecipeFormValues, pendingImageFile: File | null) => {
        setError("");
        if (!loggedUserId) return;

        const payload = {
            title: values.title,
            time: values.time ? parseInt(values.time) : null,
            servings: values.servings ? parseInt(values.servings) : null,
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
            const res = await fetch(`${API_URL}/api/Recipes`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${auth?.token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) { setError("Failed to create recipe. Please try again."); return; }

            const createdRecipe = await res.json();
            const recipeId = createdRecipe.id;
            const recipeSlug = slugifyTitle(createdRecipe.title);

            if (pendingImageFile && recipeId) {
                const formData = new FormData();
                formData.append("file", pendingImageFile);
                const imageRes = await fetch(`${API_URL}/api/Recipes/${recipeId}/image`, { method: "POST", body: formData });
                const text = await imageRes.text();
                const data = text ? JSON.parse(text) : {};
                if (data.imageUrl) {
                    
                }
            }

            router.push(`/recipes/${recipeId}/${recipeSlug}`);
        } catch (err) {
            console.error(err);
            setError("Something went wrong.");
        }
    };

    if (!loggedUserId) return (
        <EmptyView title="No permission" text="Log in to add recipes" icon="notfound" btnUrl="/login" btnText="Log in" />
    );

    return (
        <main className={AddRecipeStyles.page}>
            <h1 className={AddRecipeStyles.title}>Create a recipe</h1>
            <RecipeForm onSubmit={handleSubmit} submitLabel="Save Recipe" error={error} />
        </main>
    );
}