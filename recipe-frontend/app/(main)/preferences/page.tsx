"use client"

import { AuthContext } from "@/context/AuthContext";
import { useContext, useEffect, useState } from "react";

type Allergy = {
  id: number;
  userId: number;
  ingredientId: number;
  ingredientTypeId: number;
};

export default function Preferences() {
    const [loading, setLoading] = useState(true);
    const [userAllergies, setUserAllergies] = useState<Allergy[]>([])

    const auth = useContext(AuthContext);
    const loggedUserId = auth?.user?.id;


    useEffect(() => {
        const fetchData = async () => {

            setLoading(true);

            try {
                const res = await fetch(`http://localhost:5041/api/allergy/user/${loggedUserId}`);

                if (!res.ok) return;

                const data: Allergy[] = await res.json();

                setUserAllergies(data);
                
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [loggedUserId]);    

    return (
        <div>
            Preferences
        </div>
    )
}