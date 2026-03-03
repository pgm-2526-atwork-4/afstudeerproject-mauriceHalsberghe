"use client";

import { AuthContext } from '@/context/AuthContext';
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from 'react';

import PrefStyles from '@/app/styles/pages/preferences.module.css';
import ButtonStyles from '@/app/styles/components/button.module.css';
import AvatarUpload from '@/app/components/AvatarUpload';

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
  typeId: number;
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
        if (!auth || auth.loading) return;

        if (!auth.user?.id) {
        setLoading(false);
            return;
        }

        setAllergies([
            { id: 1, typeId: 37, name: 'Gluten', type: AllergyType.ingredient },
            { id: 2, typeId: 3, name: 'Dairy', type: AllergyType.ingredientType },
            { id: 3, typeId: 0, name: 'Peanuts', type: AllergyType.ingredient },
            { id: 4, typeId: 1, name: 'Fish', type: AllergyType.ingredientType },
            { id: 5, typeId: 49, name: 'Soy', type: AllergyType.ingredient },
            { id: 6, typeId: 12, name: 'Eggs', type: AllergyType.ingredientType },
            { id: 7, typeId: 1, name: 'Sesame', type: AllergyType.ingredient },
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
    }, [auth]);

    if (auth?.loading || loading) {
        return <p>Loading...</p>;
    }

    if (!auth?.user?.id || !auth.token) {
        return <p>User not authenticated</p>;
    }

    const loggedUserId: number = auth.user.id;

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

            router.push("/");
        } catch (err) {
            console.error(err);
        }
    };

    const progress = (step / 3) * 100;

    return (
        <div className={PrefStyles.page}>
            <div className={PrefStyles.welcome}>
                {auth.user && <h1 className={PrefStyles.title}>Welcome, {auth.user.username}!</h1>}
                <h2>Let&apos;s set up your Profile</h2>
            </div>

            <div className={PrefStyles.progress}>
                <h3 className={PrefStyles.progressSubtitle}>Step {step} of 3</h3>
                <div className={PrefStyles.progressBar}>
                    <span style={{ width: `${progress}%` }}></span>
                </div>
            </div>

            {step === 1 && (
                <div className={PrefStyles.pageStep}>
                    <h3 className={PrefStyles.subtitle}>Select your diet</h3>

                    <div className={PrefStyles.list}>
                        {diets.map((diet) => (
                            <div key={diet.id} className={PrefStyles.radio}>
                                <input
                                id={diet.name}
                                value={diet.id}
                                className={PrefStyles.radioInput}
                                type="radio"
                                checked={selectedDiet === diet.id}
                                onChange={() =>
                                    setSelectedDiet(selectedDiet === diet.id ? null : diet.id)
                                }
                                />                                
                                <label htmlFor={diet.name} className={PrefStyles.radioLabel}>{diet.name}</label>
                            </div>
                        ))}
                    </div>

                    <div className={PrefStyles.buttons}>
                        <button className={ButtonStyles.button} onClick={() => setStep(2)}>
                            {selectedDiet === null ? 'Skip' : 'Next'}
                        </button>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className={PrefStyles.pageStep}>
                    <h3 className={PrefStyles.subtitle}>Select your allergies</h3>

                    <div className={PrefStyles.list} >
                        {allergies.map((allergy) => (
                            <div key={allergy.id} className={PrefStyles.checkbox}>
                                <input id={allergy.name} className={PrefStyles.checkboxInput} type="checkbox" checked={selectedAllergies.includes(allergy.id)} onChange={() => toggleAllergy(allergy.id)}/>
                                <label htmlFor={allergy.name} className={PrefStyles.checkboxLabel}>{allergy.name}</label>
                            </div>
                        ))}
                    </div>
                    
                    <div className={PrefStyles.buttons}>
                        <button className={ButtonStyles.button} onClick={() => setStep(1)}>Back</button>

                        <button className={ButtonStyles.button} onClick={() => setStep(3)}>
                            {selectedAllergies.length < 1 ? 'Skip' : 'Next'}
                        </button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className={PrefStyles.pageStep}>
                    <h3 className={PrefStyles.subtitle}>Add an avatar</h3>

                    <AvatarUpload userId={loggedUserId} username={auth.user.username}/>

                    <div className={PrefStyles.buttons}>
                        <button className={ButtonStyles.button} onClick={() => setStep(2)}>Back</button>

                        <button className={ButtonStyles.button} onClick={handleComplete}>
                            Complete
                        </button>
                    </div>
                </div>
            )}
    </div>
  );
}