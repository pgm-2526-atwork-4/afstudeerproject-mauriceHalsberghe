"use client";

import { AuthContext } from "@/context/AuthContext";
import { useContext, useState, useEffect } from "react";
import IngredientSearch from "@/app/components/IngredientSearch";

import IngredientStyles from '@/app/styles/pages/ingredients.module.css';
import ButtonStyles from '@/app/styles/components/button.module.css';
import IngredientTypeIcon from "@/app/components/IngredientTypeIcon";

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
  alwaysInStock: boolean;
  ingredientTypeId: number;
};

type IngredientType = {
  id: number;
  name: string;
}

export default function Ingredients() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [ingredients, setIngredients] = useState<InventoryIngredient[]>([]);
  const [units, setUnits] = useState<QuantityUnit[]>([]);

  const [selectedIngredient, setSelectedIngredient] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number | undefined>();
  const [selectedUnitId, setSelectedUnitId] = useState<number | undefined>();

  const [ingredientTypes, setIngredientTypes] = useState<IngredientType[]>([]);
  const [selectedIngredientType, setSelectedIngredientType] = useState<number | undefined>();

  const auth = useContext(AuthContext);
  const loggedUserId = auth?.user?.id;

  const isQuantityFilled = quantity !== undefined;
  const isUnitFilled = selectedUnitId !== undefined;

  const isInvalidQuantity =
    (isQuantityFilled && !isUnitFilled) ||
    (!isQuantityFilled && isUnitFilled);
  

  const fetchIngredients = async () => {
    if (!loggedUserId) return;

    setLoading(true);

    try {
      const res = await fetch(
        `http://localhost:5041/api/InventoryIngredient/user/${loggedUserId}`
      );
      if (!res.ok) return;

      const data: InventoryIngredient[] = await res.json();

      const sortedData = data.sort((a, b) =>
        a.ingredient.name.localeCompare(b.ingredient.name)
      );

      setIngredients(sortedData);
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

    const fetchIngredientTypes = async () => {
    try {
      const res = await fetch("http://localhost:5041/api/IngredientTypes");
      if (!res.ok) return;

      const data: IngredientType[] = await res.json();
      setIngredientTypes(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!loggedUserId) return;
    
    const loadIngredients = async () => {
      await fetchIngredients();
      await fetchUnits();
      await fetchIngredientTypes();
    };
    
    loadIngredients();
  }, [loggedUserId]);


  const handleAddIngredient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError('');

    if (selectedIngredient === null) return;

    if (isInvalidQuantity) {
      setError("Please fill both quantity and unit, or leave both empty.");
      return;
    }

    const formData = {
      userId: loggedUserId,
      quantity: isQuantityFilled ? quantity : null,
      quantityUnitId: isUnitFilled ? selectedUnitId : null,
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

    setSelectedIngredient(null);
    setQuantity(undefined);
    setSelectedUnitId(undefined);
  };

  useEffect(() => {
    if (!isInvalidQuantity) {
      setError("");
    }
  }, [quantity, selectedUnitId]);

  const filteredIngredients = selectedIngredientType
  ? ingredients.filter(
      (item) => item.ingredient.ingredientTypeId === selectedIngredientType
    )
  : ingredients;

  return (
    <main className={IngredientStyles.page}>

      <div className={IngredientStyles.header}>

        <h1 className={IngredientStyles.title}>Ingredient Inventory</h1>

        <form className={IngredientStyles.form} onSubmit={handleAddIngredient}>

          <div className={IngredientStyles.input}>
            <div className={IngredientStyles.searchWrapper}>
              <IngredientSearch
                value={selectedIngredient}
                onIngredientChange={(ingredient: number | null) =>
                  setSelectedIngredient(ingredient)
                }
              />
            </div>

            <button
              className={`${ButtonStyles.button} ${ButtonStyles.smallButton} ${
                selectedIngredient === null || isInvalidQuantity
                  ? ButtonStyles.disabledButton
                  : ""
              }`}
              type="submit"
            >
              + Add
            </button>

          </div>

          {selectedIngredient !== null && (
            <div className={IngredientStyles.quantityInput}>
              <div className={IngredientStyles.quantity}>
                <input
                  type="number"
                  placeholder="Quantity"
                  value={quantity ?? ""}
                  onChange={(e) =>
                    setQuantity(e.target.value === "" ? undefined : Number(e.target.value))
                  }
                />
              </div>

              <div className={IngredientStyles.select}>
                <select
                  value={selectedUnitId ?? ""}
                  onChange={(e) =>
                    setSelectedUnitId(e.target.value === "" ? undefined : Number(e.target.value))
                  }
                >
                  <option value="">Select unit</option>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {error && <p className={IngredientStyles.error}>{error}</p>}
          

        </form>
      </div>

      <div className={IngredientStyles.main}>

        <div className={IngredientStyles.filters}>

          <select
            className={IngredientStyles.select}
            onChange={(e) =>
              setSelectedIngredientType(e.target.value === "" ? undefined : Number(e.target.value))}
          >
            <option value="">Select Type</option>
            {ingredientTypes.map((ingredientType) => (
              <option key={ingredientType.id} value={ingredientType.id}>
                {ingredientType.name.charAt(0).toUpperCase() + ingredientType.name.slice(1)}
              </option>
            ))}
          </select>

        </div>

        {loading ? (
          <p className={IngredientStyles.loader}>Loading Ingredients</p>
        ) : filteredIngredients.length === 0 ? (
          <p className={IngredientStyles.empty}>No ingredients</p>
        ) : (
          <ul className={IngredientStyles.list}>
            {filteredIngredients.map((ingredient) => (
              <li className={IngredientStyles.ingredient} key={ingredient.id}>

                <div className={IngredientStyles.ingredientSign}>
                  <IngredientTypeIcon id={ingredient.ingredient.ingredientTypeId} />
                  <p className={IngredientStyles.ingredientName}>{ingredient.ingredient.name}</p>
                </div>

                {ingredient.quantity != null && ingredient.quantityUnit && (
                  <p className={IngredientStyles.ingredientQuantity}>
                    {ingredient.quantity} {ingredient.quantityUnit?.shortName ?? ""}
                  </p>
                )}

              </li>
            ))}
          </ul>
        )}
      </div>

    </main>
  );
}