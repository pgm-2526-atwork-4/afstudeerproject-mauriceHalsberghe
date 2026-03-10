"use client";

import { API_URL } from "@/lib/api";
import { useRef, useState, useEffect, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import IngredientSearch, { IngredientOption } from "@/app/components/IngredientSearch";

import ButtonStyles from "@/app/styles/components/button.module.css";
import AddRecipeStyles from "@/app/styles/pages/addrecipe.module.css";
import Image from "next/image";
import UploadIcon from "@/public/upload.svg";

type QuantityUnit = {
    id: number;
    name: string;
    shortName: string;
};

type Diet = {
    id: number;
    name: string;
};

type Cuisine = {
    id: number;
    name: string;
};

export interface RecipeIngredient {
    id: number;
    ingredient: IngredientOption | null;
    quantity: number | undefined;
    unitId: number | undefined;
}

export interface Step {
    id: number;
    description: string;
}

export interface RecipeFormValues {
    title: string;
    time: string;
    dietId: number | undefined;
    cuisineId: number | undefined;
    ingredients: RecipeIngredient[];
    steps: Step[];
    imageUrl: string;
}

interface RecipeFormProps {
    initialValues?: Partial<RecipeFormValues>;
    onSubmit: (values: RecipeFormValues, pendingImageFile: File | null) => Promise<void>;
    submitLabel?: string;
    error?: string;
}

export default function RecipeForm({ initialValues, onSubmit, submitLabel = "Save Recipe", error: externalError }: RecipeFormProps) {
    const nextId = useRef(100);
    const newId = () => nextId.current++;

    const [title, setTitle] = useState(initialValues?.title ?? "");
    const [time, setTime] = useState(initialValues?.time ?? "");
    const [dietId, setDietId] = useState<number | undefined>(initialValues?.dietId);
    const [cuisineId, setCuisineId] = useState<number | undefined>(initialValues?.cuisineId);
    const [ingredients, setIngredients] = useState<RecipeIngredient[]>(
        initialValues?.ingredients?.map(i => ({
            ...i,
            unitId: i.unitId ? Number(i.unitId) : undefined
        })) ?? [{ id: 0, ingredient: null, quantity: undefined, unitId: undefined }]
    );
    const [steps, setSteps] = useState<Step[]>(
        initialValues?.steps ?? [{ id: 1, description: "" }]
    );
    const [imageUrl, setImageUrl] = useState<string>(initialValues?.imageUrl ?? "/recipe.jpg");
    const [uploaded, setUploaded] = useState(false);
    const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);

    const [units, setUnits] = useState<QuantityUnit[]>([]);
    const [diets, setDiets] = useState<Diet[]>([]);
    const [cuisines, setCuisines] = useState<Cuisine[]>([]);
    const [internalError, setInternalError] = useState("");    

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [unitsRes, dietsRes, cuisinesRes] = await Promise.all([
                    fetch(`${API_URL}/api/QuantityUnits`),
                    fetch(`${API_URL}/api/Diets`),
                    fetch(`${API_URL}/api/Cuisines`),
                ]);
                if (unitsRes.ok) setUnits(await unitsRes.json());
                if (dietsRes.ok) setDiets(await dietsRes.json());
                if (cuisinesRes.ok) setCuisines(await cuisinesRes.json());
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, []);

    const addIngredient = () =>
        setIngredients((prev) => [...prev, { id: newId(), ingredient: null, quantity: undefined, unitId: undefined }]);
    const removeIngredient = () =>
        setIngredients((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
    const updateIngredient = (id: number, ingredient: IngredientOption | null) =>
        setIngredients((prev) => prev.map((i) => (i.id === id ? { ...i, ingredient, quantity: undefined, unitId: undefined } : i)));
    const updateQuantity = (id: number, quantity: number | undefined) =>
        setIngredients((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)));
    const updateUnit = (id: number, unitId: number | undefined) =>
        setIngredients((prev) => prev.map((i) => (i.id === id ? { ...i, unitId } : i)));

    const addStep = () =>
        setSteps((prev) => [...prev, { id: newId(), description: "" }]);
    const removeStep = () =>
        setSteps((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
    const updateStep = (id: number, description: string) =>
        setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, description } : s)));

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
            setPendingImageFile(file);
            setImageUrl(URL.createObjectURL(file));      
        setUploaded(true);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setInternalError("");

        if (!title.trim()) {
            setInternalError("Please enter a recipe title.");
            return;
        }

        const invalidIngredient = ingredients
            .filter((i) => i.ingredient && !i.ingredient.alwaysInStock)
            .some((i) => (i.quantity === undefined) !== (i.unitId === undefined));

        if (invalidIngredient) {
            setInternalError("Please fill both quantity and unit for each ingredient, or leave both empty.");
            return;
        }

        await onSubmit({ title, time, dietId, cuisineId, ingredients, steps, imageUrl }, pendingImageFile);
    };

    const displayError = internalError || externalError;

    return (
        <form className={AddRecipeStyles.form} onSubmit={handleSubmit}>
            <div className={AddRecipeStyles.divs}>
                <label className={AddRecipeStyles.label}>
                    Recipe title
                    <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Title..."
                        className={AddRecipeStyles.input}
                    />
                </label>

                <label className={AddRecipeStyles.labelDuration}>
                    Duration (min)
                    <input
                        type="number"
                        value={time}
                        required
                        onChange={(e) => setTime(e.target.value)}
                        placeholder="Duration"
                        className={AddRecipeStyles.input}
                    />
                </label>
            </div>

            <label className={AddRecipeStyles.imageUpload}>
                Add image
                <input type="file" accept="image/*" onChange={handleFileChange} />
                <div className={`${AddRecipeStyles.image} ${!uploaded && AddRecipeStyles.showUpload}`}>
                    <Image src={`${API_URL}/uploads/recipe-images/${imageUrl}`} width={500} height={300} alt="Recipe image" />
                    {!uploaded && <UploadIcon className={AddRecipeStyles.uploadIcon} style={{ width: 100, height: 100 }} />}
                </div>
            </label>

            <div className={AddRecipeStyles.divs}>
                <label className={AddRecipeStyles.label}>
                    Diet
                    <select
                        value={dietId ?? ""}
                        className={AddRecipeStyles.select}
                        onChange={(e) => setDietId(e.target.value === "" ? undefined : Number(e.target.value))}
                    >
                        <option value="">Select diet</option>
                        {diets.map((diet) => (
                            <option key={diet.id} value={diet.id}>{diet.name}</option>
                        ))}
                    </select>
                </label>

                <label className={AddRecipeStyles.label}>
                    Cuisine
                    <select
                        value={cuisineId ?? ""}
                        className={AddRecipeStyles.select}
                        onChange={(e) => setCuisineId(e.target.value === "" ? undefined : Number(e.target.value))}
                    >
                        <option value="">Select cuisine</option>
                        {cuisines.map((cuisine) => (
                            <option key={cuisine.id} value={cuisine.id}>{cuisine.name}</option>
                        ))}
                    </select>
                </label>
            </div>

            <div className={AddRecipeStyles.ingredients}>
                <label className={AddRecipeStyles.label}>Ingredients</label>
                {ingredients.map((ing) => (
                    <div key={ing.id} className={AddRecipeStyles.ingredient}>
                        <IngredientSearch
                            value={ing.ingredient}
                            placeholder="Select Ingredient"
                            onIngredientChange={(option) => updateIngredient(ing.id, option)}
                        />
                        <input
                            type="number"
                            placeholder="Quantity"
                            className={AddRecipeStyles.quantityInput}
                            value={ing.quantity ?? ""}
                            onChange={(e) => updateQuantity(ing.id, e.target.value === "" ? undefined : Number(e.target.value))}
                        />
                        <select
                            value={ing.unitId ?? ""}
                            disabled={!units.length}
                            className={AddRecipeStyles.select}
                            onChange={(e) => updateUnit(ing.id, e.target.value === "" ? undefined : Number(e.target.value))}
                        >
                            <option value="">Select unit</option>
                            {units.map((unit) => (
                                <option key={unit.id} value={unit.id}>{unit.name}</option>
                            ))}
                        </select>
                    </div>
                ))}
                <div className={AddRecipeStyles.divs}>
                    <button className={`${ButtonStyles.smallButton} ${AddRecipeStyles.button}`} type="button" onClick={removeIngredient} disabled={ingredients.length <= 1}>- Remove ingredient</button>
                    <button className={`${ButtonStyles.smallButton} ${AddRecipeStyles.button}`} type="button" onClick={addIngredient}>+ Add ingredient</button>
                </div>
            </div>

            <div className={AddRecipeStyles.steps}>
                <label className={AddRecipeStyles.label}>Steps</label>
                {steps.map((step, index) => (
                    <div key={step.id} className={AddRecipeStyles.step}>
                        <span className={AddRecipeStyles.stepNumber}>{index + 1}</span>
                        <textarea
                            value={step.description}
                            className={AddRecipeStyles.stepInput}
                            onChange={(e) => updateStep(step.id, e.target.value)}
                            placeholder={`Step ${index + 1}`}
                            rows={2}
                        />
                    </div>
                ))}
                <div className={AddRecipeStyles.divs}>
                    <button className={`${ButtonStyles.smallButton} ${AddRecipeStyles.button}`} type="button" onClick={removeStep} disabled={steps.length <= 1}>- Remove step...</button>
                    <button className={`${ButtonStyles.smallButton} ${AddRecipeStyles.button}`} type="button" onClick={addStep}>+ Add step...</button>
                </div>
            </div>

            {displayError && <p>{displayError}</p>}

            <button className={ButtonStyles.button} type="submit">{submitLabel}</button>
        </form>
    );
}