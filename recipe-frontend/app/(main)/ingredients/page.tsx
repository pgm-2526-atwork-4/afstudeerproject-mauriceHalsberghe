"use client";

import { API_URL } from "@/lib/api";

import { AuthContext } from "@/context/AuthContext";
import { useContext, useState, useEffect } from "react";

import IngredientTypeIcon from "@/app/components/IngredientTypeIcon";
import AddIngredientHeader from "@/app/components/AddIngredientHeader";
import EmptyView from "@/app/components/EmptyView";
import EditIngredientModal from "@/app/components/EditIngredientModal";

import IngredientStyles from '@/app/styles/pages/ingredients.module.css';
import DeleteIngredientModal from "@/app/components/DeleteIngredientModal";
import ButtonStyles from "@/app/styles/components/button.module.css"

import { formatQuantity } from "@/lib/formatQuantity";

import EditIcon from "@/public/pencil.svg";
import TrashIcon from "@/public/trash.svg";
import AppleIcon from '@/public/apple.svg'
import { IngredientType, InventoryIngredient } from "@/types/IngredientTypes";

export default function Ingredients() {
  const [loading, setLoading] = useState(true);
  const [ingredients, setIngredients] = useState<InventoryIngredient[]>([]);

  const [quantity, setQuantity] = useState<number | undefined>();
  const [selectedUnitId, setSelectedUnitId] = useState<number | undefined>();

  const [ingredientTypes, setIngredientTypes] = useState<IngredientType[]>([]);
  const [selectedIngredientType, setSelectedIngredientType] = useState<number | undefined>();

  const [showIngredientOptions, setShowIngredientOptions ] = useState<number | null>(null);
  const [editingIngredient, setEditingIngredient] = useState<InventoryIngredient | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [search, setSearch] = useState("");

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
        `${API_URL}/api/InventoryIngredient/user/${loggedUserId}`
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

  const fetchIngredientTypes = async () => {
    try {
      const res = await fetch(`${API_URL}/api/IngredientTypes`);
      if (!res.ok) return;

      const data: IngredientType[] = await res.json();

      const sortedData = data.sort((a, b) => 
        a.name.localeCompare(b.name)
      );

      setIngredientTypes(sortedData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!loggedUserId) {
      setLoading(false);
      return;
    }
    
    const loadIngredients = async () => {
      await fetchIngredients();
      await fetchIngredientTypes();
    };
    
    loadIngredients();
  }, [loggedUserId]);

  const filteredIngredients = ingredients
    .filter((item) =>
      selectedIngredientType ? item.ingredient.ingredientTypeId === selectedIngredientType : true
    )
    .filter((item) =>
      search ? item.ingredient.name.toLowerCase().includes(search.toLowerCase()) : true
    );

  const groupedIngredients = ingredientTypes
    .map((type) => ({
      type,
      items: filteredIngredients.filter(
        (item) => item.ingredient.ingredientTypeId === type.id
      ),
    }))
    .filter((group) => group.items.length > 0);

  if (auth?.loading || loading) {
    return <main className={IngredientStyles.page}>
        <div className={IngredientStyles.header}>
            <h1 className={IngredientStyles.title}><AppleIcon />Ingredient Inventory</h1>
            <AddIngredientHeader />
        </div>
        <div className={IngredientStyles.main}>
          <span className={IngredientStyles.skeletonText}></span>
          <div className={IngredientStyles.skeletonGrid}>
              {[...Array(5)].map((_, i) => (
                  <div key={i} className={IngredientStyles.skeletonRow} />
              ))}
          </div>
        </div>
    </main>;
  }

  if (!loggedUserId) {
    return <EmptyView title='Not logged in' text="Log in to add ingredients" btnText='Log In' btnUrl='/login' icon="profile" />
  }
  

  return (
    <main className={IngredientStyles.page}>

      <div className={IngredientStyles.header}>

        <h1 className={IngredientStyles.title}><AppleIcon /> Ingredient Inventory</h1>

        <AddIngredientHeader
          postUrl={`${API_URL}/api/InventoryIngredient`}
          onSuccess={fetchIngredients}
        />
        
      </div>

      <div className={IngredientStyles.main}>

        <div className={IngredientStyles.filters}>

          <div className={IngredientStyles.searchIngWrapper}>
            <input 
              className={IngredientStyles.searchIng}
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className={IngredientStyles.select}
            value={selectedIngredientType ?? ""}
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

          <button 
            className={`${ButtonStyles.xsButton} ${!search && !selectedIngredientType ? ButtonStyles.disabledButton : ""}`}
            onClick={() => { setSearch(""); setSelectedIngredientType(undefined); }}
          >
            Clear
          </button>

        </div>

        {loading ? (
          <p className={IngredientStyles.loader}>Loading Ingredients</p>
        ) : ingredients.length === 0 ? (
          <EmptyView title='No ingredients yet' text='Add ingredients so you always know what’s in your kitchen.' icon="ingredient" />
        ) : filteredIngredients.length === 0 ? (
          <p className={IngredientStyles.noResults}>No ingredients match your search</p>
        ) : (
          
          <div className={IngredientStyles.groupedList}>
            {groupedIngredients.map(({ type, items }) => (
              <div key={type.id} className={IngredientStyles.group}>
                <h2 className={IngredientStyles.groupTitle}>
                  {type.name.charAt(0).toUpperCase() + type.name.slice(1)}
                </h2>
                <ul className={IngredientStyles.list}>
                  {items.map((ingredient) => (
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
                        <IngredientTypeIcon id={ingredient.ingredient.ingredientTypeId} />
                        <p className={IngredientStyles.ingredientName}>{ingredient.ingredient.name}</p>
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
              </div>
            ))}
          </div>
        )}
      </div>

      {editingIngredient && (
        <EditIngredientModal
          ingredient={editingIngredient}
          type="InventoryIngredient"
          onClose={() => {setEditingIngredient(null); setShowIngredientOptions(null);}}
          onSuccess={fetchIngredients}
        />
      )}

      {deletingId !== null && (
        <DeleteIngredientModal
          ingredientId={deletingId}
          type="InventoryIngredient"
          onClose={() => {
            setDeletingId(null);
            setShowIngredientOptions(null);
          }}
          onSuccess={fetchIngredients}
        />
      )}


    </main>
  );
}