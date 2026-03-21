"use client";

import { API_URL } from "@/lib/api";

import { AuthContext } from "@/context/AuthContext";
import { useContext, useEffect, useState } from "react";

import Checkbox from "@/app/components/Checkbox";
import AddIngredientHeader from "@/app/components/AddIngredientHeader";
import EmptyView from "@/app/components/EmptyView";

import IngredientStyles from "@/app/styles/pages/ingredients.module.css";
import ButtonStyles from "@/app/styles/components/button.module.css";

import EditIngredientModal from "@/app/components/EditIngredientModal";
import DeleteIngredientModal from "@/app/components/DeleteIngredientModal";

import CartIcon from '@/public/cart.svg'
import EditIcon from "@/public/pencil.svg";
import TrashIcon from "@/public/trash.svg";

import { formatQuantity } from "@/lib/formatQuantity";
import { InventoryIngredient, ListIngredient } from "@/types/IngredientTypes";

export default function ShoppingList() {
    const [loading, setLoading] = useState(true);
    const [ingredients, setIngredients] = useState<ListIngredient[]>([]);

    const uncheckedIngredients = ingredients.filter((i) => !i.checked);
    const checkedIngredients = ingredients.filter((i) => i.checked);

    const [showIngredientOptions, setShowIngredientOptions ] = useState<number | null>(null);
    const [editingIngredient, setEditingIngredient] = useState<InventoryIngredient | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const auth = useContext(AuthContext);
    const loggedUserId = auth?.user?.id;

    const fetchShoppingList = async () => {
        if (!loggedUserId) return;

        setLoading(true);

        try {
        const res = await fetch(
            `${API_URL}/api/ListIngredients/user/${loggedUserId}`,
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
        if (!loggedUserId) {
            setLoading(false);
            return;
        }
  

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
        const checkedIngredients = ingredients.filter((ingredient) => ingredient.checked);
        if (checkedIngredients.length === 0) return;

        const inventoryPayload = checkedIngredients.map((ingredient) => ({
            userId: loggedUserId,
            ingredientId: ingredient.ingredient.id,
            quantity: ingredient.quantity ?? null,
            quantityUnitId: ingredient.quantityUnit?.id ?? null,
        }));

        const inventoryRes = await fetch(`${API_URL}/api/InventoryIngredient/move`,
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

        const deleteRes = await fetch(`${API_URL}/api/ListIngredients/move`,
            {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                    userId: loggedUserId,
                    ids: checkedIngredients.map((ingredient) => ingredient.id),
                }),
            },
        );

        if (!deleteRes.ok) {
            console.error("Failed to remove from shopping list");
            return;
        }
        await fetchShoppingList();
    };

    if (auth?.loading || loading) {
        return <main className={IngredientStyles.page}>
            <div className={IngredientStyles.header}>
                <h1 className={IngredientStyles.title}><CartIcon />Shopping List</h1>
                <AddIngredientHeader />
            </div>
            <div className={IngredientStyles.mainList}>
                <div className={IngredientStyles.skeletonGridShopping}>
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className={IngredientStyles.skeletonRow} />
                    ))}
                </div>
            </div>
        </main>;
    }

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
                <h1 className={IngredientStyles.title}><CartIcon />Shopping List</h1>
                <AddIngredientHeader
                    postUrl={`${API_URL}/api/ListIngredients`}
                    onSuccess={fetchShoppingList}
                />
            </div>

            <div className={IngredientStyles.mainList}>
                {uncheckedIngredients.length <= 0 && checkedIngredients.length <= 0 && (
                    <EmptyView
                        title="Empty shopping list"
                        text="Add items so you don’t forget them at the store."
                        icon="cart"
                    />
                )}

                {uncheckedIngredients.length > 0 && (
                    <ul className={IngredientStyles.shoppingList}>
                        {uncheckedIngredients.map((ingredient) => (
                            <li 
                                className={IngredientStyles.ingredient} 
                                key={ingredient.id}
                                onClick={() =>
                                    setShowIngredientOptions(prev =>
                                    prev === ingredient.id ? null : ingredient.id
                                    )
                                }
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

                                {
                                    showIngredientOptions !== ingredient.id ? 
                                        <>
                                            {ingredient.quantity != null && ingredient.quantityUnit && (
                                            <p className={IngredientStyles.ingredientQuantity}>
                                                {formatQuantity(ingredient.quantity)} {ingredient.quantityUnit?.shortName ?? ""}
                                            </p>
                                            )}
                                        </>
                                    :

                                    <div className={IngredientStyles.buttons}>
                                        {!ingredient.ingredient.alwaysInStock && (
                                            <button
                                                className={IngredientStyles.editBtn}
                                                onClick={() => setEditingIngredient(ingredient)}
                                                aria-label="Edit ingredient"
                                            >
                                                <EditIcon />
                                            </button>
                                        )}
                                        <button
                                        className={IngredientStyles.deleteBtn}
                                        onClick={() => setDeletingId(ingredient.id)}
                                        aria-label="Delete ingredient"
                                        >
                                        <TrashIcon />
                                        </button>
                                    </div>

                                }
                                
                            </li>
                        ))}
                    </ul>
                )}

                {checkedIngredients.length > 0 && (
                    <>
                        <ul className={`${IngredientStyles.shoppingList} ${IngredientStyles.checkedList}`} >
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
                        Done shopping? Add {checkedIngredients.length} {checkedIngredients.length > 1 ? 'items' : 'item'} to your
                        inventory
                    </p>
                    <button
                        onClick={sendIngredientsToInventory}
                        className={ButtonStyles.button}
                    >
                        + Add to Inventory
                    </button>
                </div>
            )}

            {editingIngredient && (
                <EditIngredientModal
                    ingredient={editingIngredient}
                    type="ListIngredients"
                    onClose={() => {setEditingIngredient(null); setShowIngredientOptions(null);}}
                    onSuccess={fetchShoppingList}
                />
            )}
            
            {deletingId !== null && (
                <DeleteIngredientModal
                    ingredientId={deletingId}
                    type="ListIngredients"
                    onClose={() => {
                    setDeletingId(null);
                    setShowIngredientOptions(null);
                    }}
                    onSuccess={fetchShoppingList}
                />
            )}

        </main>
    );
}
