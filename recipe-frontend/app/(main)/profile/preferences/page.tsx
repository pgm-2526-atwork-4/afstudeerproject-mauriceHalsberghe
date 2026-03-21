"use client";

import { API_URL } from "@/lib/api";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";

import DietSelector from "@/app/components/DietSelector";
import AllergySelector from "@/app/components/AllergySelector";
import BackButton from "@/app/components/BackButton";

import PrefStyles from "@/app/styles/pages/preferences.module.css";
import ButtonStyles from "@/app/styles/components/button.module.css";

import PencilIcon from "@/public/edit.svg"
import EmptyView from "@/app/components/EmptyView";
import { Allergy, AllergyType, Diet } from "@/types/RecipeTypes";
import { IngredientOption } from "@/app/components/IngredientSearch";

const ALLERGIES: Allergy[] = [
    { id: 1, typeId: 37, name: 'Gluten',  type: AllergyType.ingredient },
    { id: 2, typeId: 3,  name: 'Dairy',   type: AllergyType.ingredientType },
    { id: 3, typeId: 0,  name: 'Peanuts', type: AllergyType.ingredient },
    { id: 4, typeId: 1,  name: 'Fish',    type: AllergyType.ingredientType },
    { id: 5, typeId: 49, name: 'Soy',     type: AllergyType.ingredient },
    { id: 6, typeId: 12, name: 'Eggs',    type: AllergyType.ingredientType },
    { id: 7, typeId: 1,  name: 'Sesame',  type: AllergyType.ingredient },
];

export default function Preferences() {
    const [diets, setDiets] = useState<Diet[]>([]);
    const [selectedDiet, setSelectedDiet] = useState<number | null>(null);
    const [selectedAllergies, setSelectedAllergies] = useState<number[]>([]);

    const [filterByDiet, setFilterByDiet] = useState(false);
    const [filterByAllergens, setFilterByAllergens] = useState(false);

    const [loading, setLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
    const [isEditing, setIsEditing] = useState(false);
    const [oldPreferences, setOldPreferences] = useState<{
        diet: number | null;
        allergies: number[];
        filterByDiet: boolean;
        filterByAllergens: boolean;
        customAllergies: IngredientOption[];
    }>({ diet: null, allergies: [], filterByDiet: false, filterByAllergens: false, customAllergies: [] });

    const [customAllergies, setCustomAllergies] = useState<IngredientOption[]>([]);

    const auth = useContext(AuthContext);

    useEffect(() => {
        if (!auth || !auth.user || !auth.token) {
            setLoading(false);
        return;
    }
        const { user, token } = auth;

        const fetchData = async () => {
            try {
                const dietsRes = await fetch(`${API_URL}/api/diets`);
                setDiets(await dietsRes.json());

                const prefRes = await fetch(
                    `${API_URL}/api/users/${user.id}/preferences`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const prefData = await prefRes.json();

                setSelectedDiet(prefData.dietId);
                setFilterByDiet(prefData.filterByDiet ?? false);
                setFilterByAllergens(prefData.filterByAllergens ?? false);

                const matchedIds = ALLERGIES
                    .filter(a =>
                        prefData.ingredientAllergyIds.includes(a.typeId) ||
                        prefData.ingredientTypeAllergyIds.includes(a.typeId)
                    )
                    .map(a => a.id);

                setSelectedAllergies(matchedIds);

                const knownIngredientTypeIds = new Set(
                    ALLERGIES
                        .filter(a => a.type === AllergyType.ingredient)
                        .map(a => a.typeId)
                );

                const customIds = (prefData.ingredientAllergyIds as number[])
                    .filter(id => !knownIngredientTypeIds.has(id));

                if (customIds.length > 0) {
                    const results = await Promise.all(
                        customIds.map(id =>
                            fetch(`${API_URL}/api/ingredients/${id}`).then(r => r.json())
                        )
                    );
                    setCustomAllergies(results.map(i => ({
                        value: i.id,
                        label: i.name,
                        alwaysInStock: i.alwaysInStock,
                    })));
                }

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [auth]);

    const toggleAllergy = (id: number) => {
        setSelectedAllergies(prev =>
            prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
        );
    };

    const handleEdit = () => {
        setSaveStatus("idle");
        setOldPreferences({
            diet: selectedDiet,
            allergies: [...selectedAllergies],
            filterByDiet,
            filterByAllergens,
            customAllergies: [...customAllergies],
        });
        setIsEditing(true);
    };

    const handleCancel = () => {
        setSelectedDiet(oldPreferences.diet);
        setSelectedAllergies(oldPreferences.allergies);
        setFilterByDiet(oldPreferences.filterByDiet);
        setFilterByAllergens(oldPreferences.filterByAllergens);
        setCustomAllergies(oldPreferences.customAllergies);
        setIsEditing(false);
        setSaveStatus("idle");
    };

    const handleSave = async () => {
        if (!auth?.token) return;
        setSaveStatus("idle");

        const ingredientAllergyIds = [
            ...ALLERGIES
                .filter(a => selectedAllergies.includes(a.id) && a.type === AllergyType.ingredient)
                .map(a => a.typeId),
            ...customAllergies.map(i => i.value),
        ];

        const ingredientTypeAllergyIds = ALLERGIES
            .filter(a => selectedAllergies.includes(a.id) && a.type === AllergyType.ingredientType)
            .map(a => a.typeId);

        try {
            const res = await fetch(`${API_URL}/api/users/preferences`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${auth.token}`,
                },
                body: JSON.stringify({
                    dietId: selectedDiet,
                    ingredientAllergyIds,
                    ingredientTypeAllergyIds,
                    filterByDiet,
                    filterByAllergens,
                }),
            });

            if (res.ok) {
                setSaveStatus("success");
                setIsEditing(false);
                setTimeout(() => setSaveStatus("idle"), 2000);
            } else {
                setSaveStatus("error");
                setTimeout(() => setSaveStatus("idle"), 2000);
            }
        } catch (err) {
            console.error(err);
            setSaveStatus("error");
        }
    };

    function handleAddCustomAllergy(ingredient: IngredientOption) {
        setCustomAllergies(prev =>
            prev.some(i => i.value === ingredient.value) ? prev : [...prev, ingredient]
        );
    }

    if (!auth || !auth.user || !auth.token) return <EmptyView title='Not logged in' btnText='Log In' btnUrl='/login' icon='profile'/>;

    if (loading) return <p>Loading...</p>;

    return (
        <div className={PrefStyles.pageProfile}>
            <header className={PrefStyles.header}>
                <BackButton url="/profile" absolute={false}/>
                <h1 className={PrefStyles.titleProfile}>Preferences</h1>
                <div>
                    <div className={PrefStyles.buttonsHeader}>
                        {!isEditing ? (
                            <button className={ButtonStyles.button} onClick={handleEdit}>
                                <PencilIcon />
                                Edit
                            </button>
                        ) : (
                            <>
                                <button className={ButtonStyles.secondaryButton} onClick={handleCancel}>Cancel</button>
                                <button className={ButtonStyles.button} onClick={handleSave}>Save Changes</button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <div className={PrefStyles.pageStepProfile}>
                <h3 className={PrefStyles.subtitle}>Diet type</h3>
                <DietSelector
                    diets={diets}
                    selectedDiet={selectedDiet}
                    onChange={isEditing ? setSelectedDiet : () => {}}
                    disabled={!isEditing}
                />

                <label className={PrefStyles.switchRowDiet}>
                    <span className={PrefStyles.labelText}>
                        <h2>Filter recipes by diet</h2>
                        <p>Show only recipes of your diet</p>
                    </span>

                    <div className={PrefStyles.switch}>
                        <input 
                            type="checkbox"
                            checked={filterByDiet}
                            onChange={e => isEditing && setFilterByDiet(e.target.checked)}
                            disabled={!isEditing}
                         />
                        <span className={PrefStyles.slider}></span>
                    </div>
                </label>
            </div>

            <div className={PrefStyles.pageStepProfile}>
                <h3 className={PrefStyles.subtitle}>Allergies & Intolerances</h3>
                <AllergySelector
                    allergies={ALLERGIES}
                    selectedAllergies={selectedAllergies}
                    onToggle={isEditing ? toggleAllergy : () => {}}
                    disabled={!isEditing}
                    onAddCustomAllergy={handleAddCustomAllergy}
                    customAllergies={customAllergies}
                    onRemoveCustomAllergy={isEditing ? (id) =>
                        setCustomAllergies(prev => prev.filter(i => i.value !== id)) : () => {}}
                />

                    <label className={PrefStyles.switchRowAllergy}>
                    <span className={PrefStyles.labelText}>
                        <h2>Exclude recipes with allergens</h2>
                        <p>Hide recipes containing your selected allergens</p>
                    </span>

                    <div className={PrefStyles.switch}>
                        <input 
                            type="checkbox"
                            checked={filterByAllergens}
                            onChange={e => isEditing && setFilterByAllergens(e.target.checked)}
                            disabled={!isEditing}
                        />
                        <span className={PrefStyles.slider}></span>
                    </div>
                </label>
            </div>

            <div className={PrefStyles.buttonsPref}>
                {!isEditing ? (
                    <button className={ButtonStyles.button} onClick={handleEdit}>
                        <PencilIcon />
                        Edit
                    </button>
                ) : (
                    <>
                        <button className={ButtonStyles.button} onClick={handleCancel}>Cancel</button>
                        <button className={ButtonStyles.button} onClick={handleSave}>Save Changes</button>
                    </>
                )}
            </div>

            {saveStatus === "success" && <p className={PrefStyles.message}>Preferences saved!</p>}
            {saveStatus === "error" && <p className={PrefStyles.message}>Something went wrong. Please try again.</p>}
        </div>
    );
}