"use client";

import { AuthContext } from '@/context/AuthContext';
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from 'react';

type Diet = {
  id: number;
  name: string;
};

enum AllergyType {
    ingredient,
    ingredientType
}

type Allergy = {
  id: number;
  name: string;
  type: AllergyType
};

export default function RegisterPreferences() {
    const [step, setStep] = useState(1);

    const [diets, setDiets] = useState<Diet[]>([]);
    const [allergies, setAllergies] = useState<Allergy[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedDiet, setSelectedDiet] = useState<number | null>(null);
    const [selectedAllergies, setSelectedAllergies] = useState<number[]>([]);

    const auth = useContext(AuthContext);
    const router = useRouter();

    
    useEffect(() => {
        setAllergies([
            { id: 1, name: 'Gluten', type: AllergyType.ingredient },
            { id: 2, name: 'Dairy', type: AllergyType.ingredientType },
            { id: 3, name: 'Peanuts', type: AllergyType.ingredient },
            { id: 4, name: 'Shellfish', type: AllergyType.ingredient },
            { id: 5, name: 'Soy', type: AllergyType.ingredient },
            { id: 6, name: 'Eggs', type: AllergyType.ingredient },
            { id: 7, name: 'Sesame', type: AllergyType.ingredient },
            { id: 8, name: 'Fish', type: AllergyType.ingredientType },
        ]);

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
      fetchDiets();
    }, []);

    // if (auth?.user === null) {
    //     router.push("/register/step1");
    // }

    if (!auth || !diets) {
        return <p>Loading...</p>;
    }

    const toggleAllergy = (id: number) => {
        setSelectedAllergies(prev =>
        prev.includes(id)
            ? prev.filter(a => a !== id)
            : [...prev, id]
        );
    };

    if (!auth?.token) {
        console.error("User not authenticated");
        return;
    }

    const handleComplete = async () => {
        if (!auth?.token) {
            console.error("User not authenticated");
            return;
        }

        const ingredientAllergyIds = allergies
            .filter(
                a =>
                    selectedAllergies.includes(a.id) &&
                    a.type === AllergyType.ingredient
            )
            .map(a => a.id);

        const ingredientTypeAllergyIds = allergies
            .filter(
                a =>
                    selectedAllergies.includes(a.id) &&
                    a.type === AllergyType.ingredientType
            )
            .map(a => a.id);

        try {
            await fetch("http://localhost:5041/api/users/preferences", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${auth.token}`
                },
                body: JSON.stringify({
                    dietId: selectedDiet,
                    ingredientAllergyIds,
                    ingredientTypeAllergyIds
                })
            });

            console.log("DONE");
            // router.push("/");
        } catch (err) {
            console.error(err);
        }
    };


    return (
        <div>
            {auth.user && <h1>Welcome, {auth.user.username}!</h1>}

            {step === 1 && (
                <div>
                    <h2>Step 1: Select your diet</h2>

                    <select
                    value={selectedDiet ?? "none"}
                    onChange={(e) =>
                        setSelectedDiet(
                        e.target.value === "none" ? null : Number(e.target.value)
                        )
                    }
                    >
                    <option value="none">None</option>
                    {diets.map((diet) => (
                        <option key={diet.id} value={diet.id}>
                        {diet.name}
                        </option>
                    ))}
                    </select>

                    <br />
                    <button onClick={() => setStep(2)}>
                    Next
                    </button>
                </div>
            )}

            {step === 2 && (
                <div>
                    <h2>Step 2: Select your allergies</h2>

                    {allergies.map((allergy) => (
                        <label key={allergy.id} style={{ display: "block" }}>
                        <input
                            type="checkbox"
                            checked={selectedAllergies.includes(allergy.id)}
                            onChange={() => toggleAllergy(allergy.id)}
                        />
                        {allergy.name}
                        </label>
                    ))}

                    <br />

                    <button onClick={() => setStep(1)}>Back</button>

                    <button onClick={handleComplete}>
                        Complete
                    </button>
                </div>
            )}
    </div>
  );
}