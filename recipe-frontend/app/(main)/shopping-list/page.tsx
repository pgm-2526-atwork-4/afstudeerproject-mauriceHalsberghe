"use client";

import { AuthContext } from "@/context/AuthContext";
import { useContext, useEffect, useState } from "react";

import Checkbox from "@/app/components/Checkbox";
import AddIngredientHeader from "@/app/components/AddIngredientHeader";
import EmptyView from "@/app/components/EmptyView";

import IngredientStyles from "@/app/styles/pages/ingredients.module.css";
import ButtonStyles from "@/app/styles/components/button.module.css";

type ListIngredient = {
  id: number;
  checked: boolean;
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
};

export default function ShoppingList() {
  const [loading, setLoading] = useState(true);
  const [ingredients, setIngredients] = useState<ListIngredient[]>([]);

  const uncheckedIngredients = ingredients.filter((i) => !i.checked);
  const checkedIngredients = ingredients.filter((i) => i.checked);

  const auth = useContext(AuthContext);
  const loggedUserId = auth?.user?.id;

  const fetchShoppingList = async () => {
    if (!loggedUserId) return;

    setLoading(true);

    try {
      const res = await fetch(
        `http://localhost:5041/api/ListIngredients/user/${loggedUserId}`,
      );
      if (!res.ok) return;

      const data: ListIngredient[] = await res.json();

      const sortedData = data.sort((a, b) =>
        a.ingredient.name.localeCompare(b.ingredient.name),
      );

      setIngredients(sortedData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loggedUserId) return;

    const loadData = async () => {
      await fetchShoppingList();
    };

    loadData();
  }, [loggedUserId]);

  const updateIngredientChecked = (id: number, checked: boolean) => {
    setIngredients((prev) =>
      prev.map((i) => (i.id === id ? { ...i, checked } : i)),
    );
  };

  const sendIngredientsToInventory = async () => {
    const checked = ingredients.filter((i) => i.checked);
    if (checked.length === 0) return;

    const inventoryPayload = checked.map((i) => ({
      userId: loggedUserId,
      ingredientId: i.ingredient.id,
      quantity: i.quantity ?? null,
      quantityUnitId: i.quantityUnit?.id ?? null,
    }));

    const inventoryRes = await fetch(
      "http://localhost:5041/api/InventoryIngredient/move",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inventoryPayload),
      },
    );

    if (!inventoryRes.ok) {
      console.error("Failed to add to inventory");
      return;
    }

    const deleteRes = await fetch(
      "http://localhost:5041/api/ListIngredients/move",
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: loggedUserId,
          ids: checked.map((i) => i.id),
        }),
      },
    );

    if (!deleteRes.ok) {
      console.error("Failed to remove from shopping list");
      return;
    }
    await fetchShoppingList();
  };

  if (!loggedUserId) {
    return (
      <EmptyView
        title="Not logged in"
        text="Log in to see your shopping list"
        btnText="Log In"
        btnUrl="/login"
        icon="profile"
      />
    );
  }

  return (
    <main className={IngredientStyles.page}>
      <div className={IngredientStyles.header}>
        <h1 className={IngredientStyles.title}>Shopping List</h1>
        <AddIngredientHeader
          postUrl="http://localhost:5041/api/ListIngredients"
          onSuccess={fetchShoppingList}
        />
      </div>

      <div className={IngredientStyles.main}>
        {uncheckedIngredients.length <= 0 && checkedIngredients.length <= 0 && (
          <EmptyView
            title="Empty shopping list"
            text="Add items so you don’t forget them at the store."
            icon="cart"
          />
        )}

        {uncheckedIngredients.length > 0 && (
          <ul className={IngredientStyles.list}>
            {uncheckedIngredients.map((ingredient) => (
              <li className={IngredientStyles.ingredient} key={ingredient.id}>
                <div className={IngredientStyles.ingredientSign}>
                  <Checkbox
                    initialChecked={ingredient.checked}
                    listIngredientId={ingredient.id}
                    userId={loggedUserId}
                    onChange={updateIngredientChecked}
                  />
                  <p>{ingredient.ingredient.name}</p>
                </div>

                {ingredient.quantity != null && ingredient.quantityUnit && (
                  <p className={IngredientStyles.ingredientQuantity}>
                    {ingredient.quantity}{" "}
                    {ingredient.quantityUnit?.shortName ?? ""}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}

        {checkedIngredients.length > 0 && (
          <>
            <ul
              className={`${IngredientStyles.list} ${IngredientStyles.checkedList}`}
            >
              {checkedIngredients.map((ingredient) => (
                <li
                  className={`${IngredientStyles.ingredient} ${IngredientStyles.checkedIngredient}`}
                  key={ingredient.id}
                >
                  <div className={IngredientStyles.ingredientSign}>
                    <Checkbox
                      initialChecked={ingredient.checked}
                      listIngredientId={ingredient.id}
                      userId={loggedUserId}
                      onChange={updateIngredientChecked}
                    />
                    <p>{ingredient.ingredient.name}</p>
                  </div>

                  {ingredient.quantity != null && ingredient.quantityUnit && (
                    <p className={IngredientStyles.ingredientQuantity}>
                      {ingredient.quantity}{" "}
                      {ingredient.quantityUnit?.shortName ?? ""}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {checkedIngredients.length > 0 && (
        <div className={IngredientStyles.ingredientAdd}>
          <p>
            Done shopping? Add {checkedIngredients.length} items to your
            inventory.
          </p>
          <button
            onClick={sendIngredientsToInventory}
            className={ButtonStyles.button}
          >
            + Add to Inventory
          </button>
        </div>
      )}
    </main>
  );
}
