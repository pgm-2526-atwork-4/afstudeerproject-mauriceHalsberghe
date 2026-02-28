"use client";

import { AuthContext } from "@/context/AuthContext";
import { useContext, useState, useEffect } from "react";
import IngredientSearch from "@/app/components/IngredientSearch";

type InventoryIngredient = {
  id: number;
  quantity?: number;
  quantityUnit?: QuantityUnit;
  ingredient: Ingredient;
};

type QuantityUnit = {
  id: number;
  name: string;
  shortName: string;
};

type Ingredient = {
  id: number;
  name: string;
};

export default function Ingredients() {
  const [loading, setLoading] = useState(true);

  const [ingredients, setIngredients] = useState<InventoryIngredient[]>([]);
  const [units, setUnits] = useState<QuantityUnit[]>([]);

  const [selectedIngredient, setSelectedIngredient] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number | undefined>();
  const [selectedUnitId, setSelectedUnitId] = useState<number | undefined>();

  const auth = useContext(AuthContext);
  const loggedUserId = auth?.user?.id;
  

  const fetchIngredients = async () => {
    if (!loggedUserId) return;

    setLoading(true);

    try {
      const res = await fetch(
        `http://localhost:5041/api/InventoryIngredient/user/${loggedUserId}`
      );
      if (!res.ok) return;

      const data: InventoryIngredient[] = await res.json();
      setIngredients(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnits = async () => {
    try {
      const res = await fetch("http://localhost:5041/api/QuantityUnits");
      if (!res.ok) return;

      const data: QuantityUnit[] = await res.json();
      setUnits(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!loggedUserId) return;
    
    const loadIngredients = async () => {
      await fetchIngredients();
      await fetchUnits();
    };
    
    loadIngredients();
  }, [loggedUserId]);


  const handleAddIngredient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = {
      userId: loggedUserId,
      quantity,
      quantityUnitId: selectedUnitId,
      ingredientId: selectedIngredient
    };

    console.log(formData);

    try {
        await fetch("http://localhost:5041/api/InventoryIngredient", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        await fetchIngredients();
    } catch (err) {
      console.error(err);
    }

    
  };

  return (
    <>
      <h1>Ingredients</h1>

      <form onSubmit={handleAddIngredient}>
        <h2>Add ingredient</h2>

        <IngredientSearch
          onIngredientChange={((ingredient: number | null )=> setSelectedIngredient(ingredient))}
        />

        <div>
          <input
            type="number"
            placeholder="Quantity"
            value={quantity ?? ""}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
        </div>

        <div>
          <select
            value={selectedUnitId ?? ""}
            onChange={(e) => setSelectedUnitId(Number(e.target.value))}
          >
            <option value="">Select unit</option>

            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name}
              </option>
            ))}
          </select>
        </div>

        <button type="submit">
          Add
        </button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {ingredients.map((ingredient) => (
            <li key={ingredient.id}>
              <p>{ingredient.ingredient.name}</p>
              {ingredient.quantity != null && ingredient.quantityUnit && (
                <p>
                  {ingredient.quantity} {ingredient.quantityUnit?.shortName ?? ""}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

    </>
  );
}