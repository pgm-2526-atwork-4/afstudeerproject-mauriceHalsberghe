"use client";

import { API_URL } from "@/lib/api";

import Image from "next/image";
import { useParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";

import DetailStyles from "@/app/styles/pages/recipe-detail.module.css";
import ModalStyles from "@/app/styles/components/modal.module.css";
import ButtonStyles from "@/app/styles/components/button.module.css";

import Link from "next/link";
import BackButton from "@/app/components/BackButton";

import RatingStars from "@/app/components/RatingStars";
import RatingModal from "@/app/components/RatingModal";
import { AuthContext } from "@/context/AuthContext";

import Checkmark from "@/public/ingredient_stock.svg";
import Cross from "@/public/ingredient_not_stock.svg";
import Cart from "@/public/ingredient_cart.svg";
import Apple from "@/public/ingredient_half_stock.svg";


import { formatQuantity } from "@/lib/formatQuantity";
import { slugifyTitle } from "@/lib/slugifyTitle";
import { RecipeDetails } from "@/types/RecipeTypes";

export default function RecipeDetail() {
  const [loading, setLoading] = useState(true);
  const [recipe, setRecipe] = useState<RecipeDetails | null>(null);
  const [showModal, setShowModal] = useState(false);

  const params = useParams();
  const recipeId = Number(params.id);

  const auth = useContext(AuthContext);
  const loggedUserId = auth?.user?.id;

  const fetchRecipe = async () => {
    try {
      let url = `${API_URL}/api/recipes/${recipeId}`;
      if (loggedUserId) {
        url = `${API_URL}/api/recipes/${recipeId}?currentUserId=${loggedUserId}`;
      }
      const res = await fetch(url);
      const recipeData: RecipeDetails = await res.json();
      setRecipe(recipeData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchRecipe();
  }, [recipeId, loggedUserId]);

  const hasMissingIngredients = recipe?.ingredients.some(
    (ingredient) =>
      ingredient.hasEnoughInInventory === false &&
      ingredient.isInShoppingList === false,
  );

  const handleAddMissingToShoppingList = async () => {
    if (!loggedUserId) return;
    if (!recipe) return;

    const missingIngredients = recipe.ingredients.filter(
      (ingredient) =>
        ingredient.hasEnoughInInventory === false &&
        ingredient.isInShoppingList === false,
    );

    if (missingIngredients.length === 0) return;

    try {      
      
      await Promise.all(
        missingIngredients.map((ingredient) =>
          fetch(`${API_URL}/api/listingredients`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: loggedUserId,
              ingredientId: ingredient.ingredientId,
              quantity: ingredient.alwaysInStock ? null : ingredient.missingAmount ?? ingredient.quantity ?? null,
              quantityUnitId: ingredient.alwaysInStock ? null : ingredient.quantityUnitId ?? null,
            }),
          }),
        ),
      );
      await fetchRecipe();
    } catch (err) {
      console.error(err);
    }
  };

  if (!recipe) {
    return <p>Recipe not found</p>;
  }  

  return (
    <div className={DetailStyles.page}>
      <div className={DetailStyles.header}>
        <BackButton url="/" absolute={false} />
        <h1 className={DetailStyles.title}>{recipe.title}</h1>
        <div className={DetailStyles.userDetails}>
          {recipe.user &&
            (recipe.user.id === loggedUserId ? (
              <Link
                className={ButtonStyles.smallButton}
                href={`/recipes/${recipeId}/${slugifyTitle(recipe.title)}/edit`}
              >
                Edit Recipe
              </Link>
            ) : (
              <Link
                href={`/users/${recipe.user.username}`}
                className={DetailStyles.user}
              >
                <Image
                  className={DetailStyles.avatar}
                  width={64}
                  height={64}
                  alt={recipe.user.username}
                  src={
                    recipe.user.avatar
                      ? `${API_URL}/uploads/avatars/${recipe.user.avatar}`
                      : "/avatar.svg"
                  }
                />
                <p className={DetailStyles.username}>{recipe.user.username}</p>
              </Link>
            ))}
        </div>
      </div>

      <Image
        className={DetailStyles.image}
        width={360}
        height={200}
        alt={recipe.title}
        src={`${API_URL}/uploads/recipe-images/${recipe.imageUrl}`}
      />

      <div className={DetailStyles.detailData}>
        <div onClick={() => setShowModal(true)}>
          {recipe.averageRating ? (
            <div className={DetailStyles.ratingAmount}>
              <RatingStars amount={recipe.averageRating} />
              <p>{recipe.averageRating}</p>
            </div>
          ) : (
            <p className={DetailStyles.rating}>No ratings yet</p>
          )}
        </div>
        <p className={DetailStyles.duration}>{recipe.time} min</p>
      </div>

      <h2 className={DetailStyles.subtitle}>Ingredients</h2>

      <div className={DetailStyles.content}>
        <ul className={DetailStyles.ingredients}>
          {recipe.ingredients.map((ingredient) => (
            <li className={DetailStyles.ingredient} key={ingredient.id}>
              {ingredient.hasEnoughInInventory !== undefined && (
                <span className={DetailStyles.ingredientIcon}>
                  {ingredient.hasEnoughInInventory ? (
                    <Checkmark />
                  ) : ingredient.isInShoppingList ? (
                    <Cart />
                  ) : ingredient.hasPartialInInventory ? (
                    <Apple />
                  ) : (
                    <Cross />
                  )}
                </span>
              )}

              {ingredient.quantity && (
                <p className={DetailStyles.ingredientAmount}>
                  {formatQuantity(ingredient.quantity)}
                  {ingredient.unit}
                </p>
              )}
              <p className={DetailStyles.ingredientName}>
                {ingredient.ingredientName}
              </p>
            </li>
          ))}
        </ul>

        {hasMissingIngredients && (
          <button
            className={ButtonStyles.smallButton}
            onClick={handleAddMissingToShoppingList}
            disabled={!loggedUserId}
          >
            Add to shopping list
          </button>
        )}
      </div>

      <h2 className={DetailStyles.subtitle}>Instructions</h2>
      <ul className={DetailStyles.steps}>
        {recipe.steps.map((step) => (
          <li className={DetailStyles.step} key={step.id}>
            <p className={DetailStyles.stepNumber}>{step.stepNumber}</p>
            <p className={DetailStyles.stepDescription}>{step.description}</p>
          </li>
        ))}
      </ul>

      {showModal &&
        (loggedUserId ? (
          <div
            className={ModalStyles.modalOverlay}
            onClick={() => setShowModal(false)}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <RatingModal
                userId={loggedUserId}
                recipeId={recipeId}
                onClose={() => setShowModal(false)}
                onRated={fetchRecipe}
              />
            </div>
          </div>
        ) : (
          <div
            className={ModalStyles.modalOverlay}
            onClick={() => setShowModal(false)}
          >
            <div
              className={ModalStyles.modal}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={ModalStyles.text}>
                <h2 className={ModalStyles.title}>Not logged in</h2>
                <p className={ModalStyles.subtitle}>Log in to rate recipes</p>
              </div>

              <div className={ModalStyles.buttons}>
                <button
                  className={ButtonStyles.secondaryButton}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <Link className={ButtonStyles.button} href={"/login"}>
                  Log in
                </Link>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}
