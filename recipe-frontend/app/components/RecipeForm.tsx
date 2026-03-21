"use client";

import { API_URL } from "@/lib/api";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

import IngredientSearch, { IngredientOption } from "@/app/components/IngredientSearch";
import { Cuisine, Diet, DishType } from "@/types/RecipeTypes";
import { QuantityUnit } from "@/types/IngredientTypes";

import ButtonStyles from "@/app/styles/components/button.module.css";
import AddRecipeStyles from "@/app/styles/pages/addrecipe.module.css";

import UploadIcon from "@/public/upload.svg";

export interface RecipeIngredient {
    id: number;
    ingredient: IngredientOption | null;
    quantity: number | undefined;
    unitId: number | undefined;
}

type Step = {
    id: number;
    stepNumber: number;
    description: string;
}

export interface RecipeFormValues {
    title: string;
    time: string;
    servings: string;
    dietId: number | undefined;
    cuisineId: number | undefined;
    dishTypeId: number | undefined;
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
    const [servings, setServings] = useState(initialValues?.servings ?? "");
    const [dietId, setDietId] = useState<number | undefined>(initialValues?.dietId);
    const [cuisineId, setCuisineId] = useState<number | undefined>(initialValues?.cuisineId);
    const [dishTypeId, setDishTypeId] = useState<number | undefined>(initialValues?.dishTypeId);

    const [ingredients, setIngredients] = useState<RecipeIngredient[]>(
        initialValues?.ingredients?.map(i => ({
            ...i,
            unitId: i.unitId ? Number(i.unitId) : undefined
        })) ?? [{ id: 0, ingredient: null, quantity: undefined, unitId: undefined }]
    );

    const [steps, setSteps] = useState<Step[]>(
        initialValues?.steps ?? [{ id: 1, stepNumber: 1, description: "" }]
    );
    
    const [imageUrl, setImageUrl] = useState<string>(initialValues?.imageUrl ?? "/recipe.jpg");
    const [uploaded, setUploaded] = useState(false);
    const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);

    const [units, setUnits] = useState<QuantityUnit[]>([]);
    const [diets, setDiets] = useState<Diet[]>([]);
    const [cuisines, setCuisines] = useState<Cuisine[]>([]);
    const [dishTypes, setDishTypes] = useState<DishType[]>([]);
    const [internalError, setInternalError] = useState("");    

    const [step, setStep] = useState(1);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [unitsRes, dietsRes, cuisinesRes, dishTypesRes] = await Promise.all([
                    fetch(`${API_URL}/api/QuantityUnits`),
                    fetch(`${API_URL}/api/Diets`),
                    fetch(`${API_URL}/api/Cuisines`),
                    fetch(`${API_URL}/api/DishTypes`),
                ]);
                if (unitsRes.ok) setUnits(await unitsRes.json());
                if (dietsRes.ok) setDiets(await dietsRes.json());
                if (cuisinesRes.ok) setCuisines(await cuisinesRes.json());
                if (dishTypesRes.ok) setDishTypes(await dishTypesRes.json());
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
        setSteps((prev) => [...prev, { id: newId(), stepNumber: prev.length + 1, description: "" }]);
    const removeStep = () =>
        setSteps((prev) =>
            prev.length > 1
                ? prev.slice(0, -1).map((s, i) => ({ ...s, stepNumber: i + 1 }))
                : prev
        );
    const updateStep = (id: number, description: string) =>
        setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, description } : s)));

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
            setPendingImageFile(file);
            setImageUrl(URL.createObjectURL(file));      
        setUploaded(true);
    };

    const handleStepNavigation = (targetStep: number) => {
        setInternalError("");

        if (targetStep === 2 && step === 1) {
            if (!title.trim()) {
                setInternalError("Please enter a recipe title.");
                return;
            }
            if (!time.trim()) {
                setInternalError("Please enter a duration.");
                return;
            }
        }

        if (targetStep === 3 && step === 2) {
            const hasIngredient = ingredients.some((i) => i.ingredient !== null);
            if (!hasIngredient) {
                setInternalError("Please add at least one ingredient.");
                return;
            }
        }

        setStep(targetStep);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setInternalError("");

        if (!title.trim()) {
            setInternalError("Please enter a recipe title.");
            return;
        }

        const hasIngredient = ingredients.some((i) => i.ingredient !== null);
        if (!hasIngredient) {
            setInternalError("Please add at least one ingredient.");
            return;
        }

        const invalidIngredient = ingredients
            .filter((i) => i.ingredient && !i.ingredient.alwaysInStock)
            .some((i) => {
                const hasQuantity = i.quantity !== undefined && i.quantity !== null;
                const hasUnit = i.unitId !== undefined && i.unitId !== null && i.unitId !== ("" as unknown);
                return hasQuantity !== hasUnit;
            });

        if (invalidIngredient) {
            setInternalError("Please fill both quantity and unit for each ingredient, or leave both empty.");
            return;
        }

        const hasStep = steps.some((s) => s.description.trim() !== "");
        if (!hasStep) {
            setInternalError("Please add at least one step.");
            return;
        }

        await onSubmit({ title, time, servings, dietId, cuisineId, dishTypeId, ingredients, steps, imageUrl }, pendingImageFile);
    };

    const displayError = internalError || externalError;

    const progress = (step / 3) * 100;    

    return (
        <form className={AddRecipeStyles.form} onSubmit={handleSubmit}>

            <div className={AddRecipeStyles.progress}>
                <h3 className={AddRecipeStyles.progressSubtitle}>Step {step} of 3</h3>
                <div className={AddRecipeStyles.progressBar}>
                    <span style={{ width: `${progress}%` }}></span>
                </div>
            </div>

            {displayError && <p className={AddRecipeStyles.error}>{displayError}</p>}
            
            {step === 1 &&

            <>
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

                    <div className={AddRecipeStyles.secondaryInputs}>
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

                        <label className={AddRecipeStyles.labelServings}>
                            Servings
                            <input
                                type="number"
                                value={servings}
                                onChange={(e) => setServings(e.target.value)}
                                placeholder="Servings"
                                className={AddRecipeStyles.input}
                            />
                        </label>
                    </div>
                </div>

                <label className={AddRecipeStyles.imageUpload}>
                    Add image
                    <input type="file" accept="image/*" onChange={handleFileChange} />
                    <div className={`${AddRecipeStyles.image} ${!uploaded && AddRecipeStyles.showUpload}`}>
                        <Image 
                            src={
                                imageUrl === "/recipe.jpg" || imageUrl.startsWith("blob:")
                                    ? imageUrl 
                                    : `${API_URL}/uploads/recipe-images/${imageUrl}`
                            } 
                            width={500} 
                            height={300} 
                            alt="Recipe image" 
                        />
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

                    <label className={AddRecipeStyles.label}>
                        DishType
                        <select
                            value={dishTypeId ?? ""}
                            className={AddRecipeStyles.select}
                            onChange={(e) => setDishTypeId(e.target.value === "" ? undefined : Number(e.target.value))}
                        >
                            <option value="">Select dish type</option>
                            {dishTypes.map((dishType) => (
                                <option key={dishType.id} value={dishType.id}>{dishType.name}</option>
                            ))}
                        </select>
                    </label>
                </div>

                <div className={AddRecipeStyles.buttons}>
                    <Link className={ButtonStyles.secondaryButton} href={'/'}>Cancel</Link>
                    <button type="button" className={ButtonStyles.button} onClick={() => handleStepNavigation(2)}>Next</button>
                </div>
            </>
            
            }

            {step === 2 && 
                <>
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
                            <button className={`${ButtonStyles.smallButton} ${ButtonStyles.secondaryButton}`} type="button" onClick={removeIngredient} disabled={ingredients.length <= 1}>- Remove ingredient</button>
                            <button className={`${ButtonStyles.smallButton} ${ButtonStyles.secondaryButton}`} type="button" onClick={addIngredient}>+ Add ingredient</button>
                        </div>
                    </div>

                    <div className={AddRecipeStyles.buttons}>
                        <button type="button" className={ButtonStyles.button} onClick={() => handleStepNavigation(1)}>Previous</button>
                        <button type="button" className={ButtonStyles.button} onClick={() => handleStepNavigation(3)}>Next</button>
                    </div>
                </>
            }

            {step === 3 && 

                <>
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
                            <button className={`${ButtonStyles.smallButton} ${ButtonStyles.secondaryButton}`} type="button" onClick={removeStep} disabled={steps.length <= 1}>- Remove step...</button>
                            <button className={`${ButtonStyles.smallButton} ${ButtonStyles.secondaryButton}`} type="button" onClick={addStep}>+ Add step...</button>
                        </div>
                    </div>

                    <div className={AddRecipeStyles.buttons}>
                        <button className={ButtonStyles.button} onClick={() => handleStepNavigation(2)}>Previous</button>
                        <button className={ButtonStyles.button} type="submit">{submitLabel}</button>
                    </div>
                </>

            }

        </form>
    );
}