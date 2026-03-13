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
    const auth = useContext(AuthContext);

    const [diets, setDiets] = useState<Diet[]>([]);
    const [selectedDiet, setSelectedDiet] = useState<number | null>(null);
    const [selectedAllergies, setSelectedAllergies] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
    const [isEditing, setIsEditing] = useState(false);
    const [oldPreferences, setOldPreferences] = useState<{ diet: number | null; allergies: number[] }>({ diet: null, allergies: [] });

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

                const matchedIds = ALLERGIES
                    .filter(a =>
                        prefData.ingredientAllergyIds.includes(a.typeId) ||
                        prefData.ingredientTypeAllergyIds.includes(a.typeId)
                    )
                    .map(a => a.id);

                setSelectedAllergies(matchedIds);
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
        setOldPreferences({ diet: selectedDiet, allergies: [...selectedAllergies] });
        setIsEditing(true);
    };

    const handleCancel = () => {
        setSelectedDiet(oldPreferences.diet);
        setSelectedAllergies(oldPreferences.allergies);
        setIsEditing(false);
        setSaveStatus("idle");
    };

    const handleSave = async () => {
        if (!auth?.token) return;
        setSaveStatus("idle");

        const ingredientAllergyIds = ALLERGIES
            .filter(a => selectedAllergies.includes(a.id) && a.type === AllergyType.ingredient)
            .map(a => a.typeId);

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
                body: JSON.stringify({ dietId: selectedDiet, ingredientAllergyIds, ingredientTypeAllergyIds }),
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

    if (!auth || !auth.user || !auth.token) return <EmptyView title='Not logged in' btnText='Log In' btnUrl='/login' icon='profile'/>;

    if (loading) return <p>Loading...</p>;

    return (
        <div className={PrefStyles.pageProfile}>
            <BackButton url="/profile" absolute={true}/>
            <h1 className={PrefStyles.titleProfile}>Preferences</h1>

            <div className={PrefStyles.pageStepProfile}>
                <h3 className={PrefStyles.subtitle}>Diet</h3>
                <DietSelector
                    diets={diets}
                    selectedDiet={selectedDiet}
                    onChange={isEditing ? setSelectedDiet : () => {}}
                    disabled={!isEditing}
                />

                <label className="switch">
                    Show only recipes of your diet
                    <input type="checkbox" />
                    <span className="slider round"></span>
                </label>
            </div>

            <div className={PrefStyles.pageStepProfile}>
                <h3 className={PrefStyles.subtitle}>Allergies</h3>
                <AllergySelector
                    allergies={ALLERGIES}
                    selectedAllergies={selectedAllergies}
                    onToggle={isEditing ? toggleAllergy : () => {}}
                    disabled={!isEditing}
                />

                <label className="switch">
                    Show only recipes without allergies
                    <input type="checkbox" />
                    <span className="slider round"></span>
                </label>
            </div>

            <div className={PrefStyles.buttons}>
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