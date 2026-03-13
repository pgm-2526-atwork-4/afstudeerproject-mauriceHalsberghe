"use client";

import { API_URL } from "@/lib/api";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useParams, useRouter } from "next/navigation";
import RecipeForm, { RecipeFormValues } from "@/app/components/RecipeForm";
import EmptyView from "@/app/components/EmptyView";
import { slugifyTitle } from "@/lib/slugifyTitle";
import { RecipeDetails } from "@/types/RecipeTypes";

import AddRecipeStyles from "@/app/styles/pages/addrecipe.module.css";
import ButtonStyles from "@/app/styles/components/button.module.css";
import ModalStyles from "@/app/styles/components/modal.module.css";

export default function EditRecipe() {
    const [recipe, setRecipe] = useState<RecipeDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [units, setUnits] = useState<{ id: number; name: string; shortName: string }[]>([]);

    const [showDeleteModal, setShowDeleteModal] = useState(false);

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

    if (recipe?.user?.id !== loggedUserId) return (
        <EmptyView title="No permission" text="You can't edit this recipe" icon="notfound" btnUrl="/" btnText="Home" />
    );


    const initialValues: RecipeFormValues = {
        title: recipe.title,
        time: String(recipe.time ?? ""),
        dietId: recipe.diet?.id,
        cuisineId: recipe.cuisine?.id,
        imageUrl: recipe.imageUrl ?? "/recipe.jpg",
        steps: recipe.steps
            .sort((a, b) => a.stepNumber - b.stepNumber)
            .map((s, index) => ({ id: s.id, stepNumber: index + 1, description: s.description })),
        ingredients: recipe.ingredients.map((ing, index) => {
            const unit = units.find(
                u => u.shortName.toLowerCase() === ing.unit?.toLowerCase()
            );

            return {
                id: index,
                ingredient: {
                    value: ing.ingredientId,
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

            const slug = slugifyTitle(values.title);

            router.push(`/recipes/${recipeId}/${slug}`);
        } catch (err) {
            console.error(err);
            setError("Something went wrong.");
        }
    };

    const handleDelete = async () => {
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/recipes/${recipeId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });

            if (!res.ok) {
                setError("Failed to delete recipe. Please try again.");
                return;
            }

            router.push("/");

        } catch (err) {
            console.error(err);
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
            setShowDeleteModal(false);
        }
    };

    return (
        <main className={AddRecipeStyles.page}>
            <div className={AddRecipeStyles.header}>
                <h1 className={AddRecipeStyles.title}>Edit recipe</h1>
                <button className={`${ButtonStyles.buttonRed} ${ButtonStyles.smallButton}`} onClick={() => setShowDeleteModal(true)}>Delete Recipe</button>
            </div>
            { loading ? <p>Loading...</p> : 
                <RecipeForm
                    key={recipe.id}
                    initialValues={initialValues}
                    onSubmit={handleSubmit}
                    submitLabel="Update Recipe"
                    error={error}
                />
            }

            {
                showDeleteModal && 
                <div className={ModalStyles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
                    <div className={ModalStyles.modal}>
                        <div className={ModalStyles.text}>
                        <h2 className={ModalStyles.title}>Delete Recipe</h2>
                        <p className={ModalStyles.subtitle}>
                            Are you sure you want to delete this recipe?
                        </p>
                        </div>

                        {error && <p className={ModalStyles.error}>{error}</p>}

                        <div className={ModalStyles.buttons}>
                        <button
                            className={ButtonStyles.secondaryButton}
                            onClick={() => setShowDeleteModal(false)}
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button
                            className={ButtonStyles.buttonRed}
                            onClick={handleDelete}
                            disabled={loading}
                        >
                            {loading ? "Deleting..." : "Delete"}
                        </button>
                        </div>
                    </div>
                    </div>
            }
        </main>
    );
}