"use client";

import { API_URL } from "@/lib/api";

import Image from "next/image";
import { useParams } from "next/navigation";
import { useContext, useEffect, useMemo, useState } from "react";

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
import LikeFilledIcon from "@/public/like_filled.svg";
import LikeUnfilledIcon from "@/public/like_unfilled.svg";
import EditIcon from "@/public/edit.svg";

import { formatQuantity } from "@/lib/formatQuantity";
import { slugifyTitle } from "@/lib/slugifyTitle";
import { RecipeDetails } from "@/types/RecipeTypes";
import CommentPage from "@/app/components/CommentPage";
import LikeButton from "@/app/components/LikeButton";
import EmptyView from "@/app/components/EmptyView";
import ShareButton from "@/app/components/ShareButton";

export default function RecipeDetail() {
  const [loading, setLoading] = useState(true);
  const [recipe, setRecipe] = useState<RecipeDetails | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);

  const [showShoppingListModal, setShowShoppingListModal] = useState(false);
  const [showCompleteRecipeModal, setShowCompleteRecipeModal] = useState(false);

  const [displayLiked, setDisplayLiked] = useState(false);
  const [displayLikeCount, setDisplayLikeCount] = useState(0);

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
      if (!res.ok) {
        setRecipe(null);
        return;
      }
      const recipeData: RecipeDetails = await res.json();
      setRecipe(recipeData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth?.loading) return;
    fetchRecipe();
  }, [recipeId, loggedUserId]);

  useEffect(() => {
    if (recipe) {
      setDisplayLiked(recipe.isLikedByCurrentUser ?? false);
      setDisplayLikeCount(recipe.likeCount);
    }
  }, [recipe]);

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

    setShowShoppingListModal(false);

    try {
      await Promise.all(
        missingIngredients.map((ingredient) =>
          fetch(`${API_URL}/api/listingredients`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: loggedUserId,
              ingredientId: ingredient.ingredientId,
              quantity: ingredient.alwaysInStock
                ? null
                : (ingredient.missingAmount ?? ingredient.quantity ?? null),
              quantityUnitId: ingredient.alwaysInStock
                ? null
                : (ingredient.quantityUnitId ?? null),
            }),
          }),
        ),
      );
      await fetchRecipe();
    } catch (err) {
      console.error(err);
    }
  };

  const hasAllIngredients = recipe?.ingredients
    .filter((i) => !i.alwaysInStock)
    .every((i) => i.hasEnoughInInventory === true);

  const handleRemoveUsedIngredients = async () => {
    if (!loggedUserId) return;

    try {
      await fetch(
        `${API_URL}/api/inventoryingredient/remove/${recipeId}/user/${loggedUserId}`,
        {
          method: "POST",
        },
      );
      setShowCompleteRecipeModal(false);
      setShowRatingModal(true);
      await fetchRecipe();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return ( 
    <div className={DetailStyles.page}>
      <div className={DetailStyles.header}>
        <span className={DetailStyles.skeletonTitle}></span>
      </div>
      <div className={DetailStyles.main}>
        <div className={DetailStyles.skeletonImage}></div>

        <div className={DetailStyles.detailData}>
          <span className={DetailStyles.skeletonDetailData}></span>
        </div>

        <div className={DetailStyles.subtitleDiv}>
          <span className={DetailStyles.skeletonSubtitle}></span>
        </div>

        <div className={DetailStyles.content}>
          <ul className={DetailStyles.ingredients}>
            {[...Array(5)].map((width, i) => (
              <li
                className={DetailStyles.skeletonIngredient}
                key={i}
                style={{ width: `${width}rem` }}
              ></li>
            ))}
          </ul>
        </div>

        <div className={DetailStyles.subtitleDiv}>
          <span className={DetailStyles.skeletonSubtitle}></span>
        </div>

        <ul className={DetailStyles.steps}>
          {[...Array(5)].map((width, i) => (
            <li
              className={DetailStyles.skeletonIngredient}
              key={i}
              style={{ width: `${width}rem` }}
            ></li>
          ))}
        </ul>


        
      </div>
    </div>
  );


  if (!recipe) {
    return <EmptyView title="Recipe not found" text="This recipe does not exist" icon="recipe" btnUrl="/" btnText="Back" />;
  }

  return (
    <div className={DetailStyles.page}>
      <div className={DetailStyles.header}>
        <BackButton url="/" absolute={false} />
        <h1 className={DetailStyles.title}>{recipe.title}</h1>
        <div className={DetailStyles.userDetails}>
          <ShareButton title={recipe.title} />
          {recipe.user &&
            (recipe.user.id === loggedUserId ? (
              <Link
                className={ButtonStyles.xsButton}
                href={`/recipes/${recipeId}/${slugifyTitle(recipe.title)}/edit`}
              >
                <EditIcon />
                <span className={DetailStyles.editSpan}>Edit</span>
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

      <div className={DetailStyles.main}>
        <Image
          className={DetailStyles.image}
          width={360}
          height={200}
          alt={recipe.title}
          src={`${API_URL}/uploads/recipe-images/${recipe.imageUrl}`}
        />

        <LikeButton
          key={`${recipe.id}-${auth?.user?.id ?? "guest"}`}
          recipeId={recipe.id}
          initialLiked={recipe.isLikedByCurrentUser ?? false}
          initialLikeCount={recipe.likeCount}
          userId={auth?.user?.id}
          onUnlike={() => {}}
          onLikeCountChange={setDisplayLikeCount}
          onLikedChange={setDisplayLiked}
        />

        <div className={DetailStyles.tags}>
          {recipe.diet && (
            <p className={DetailStyles.tag}>{recipe.diet.name}</p>
          )}
          {recipe.cuisine && (
            <p className={DetailStyles.tag}>{recipe.cuisine.name}</p>
          )}
          {recipe.dishType && (
            <p className={DetailStyles.tag}>{recipe.dishType.name}</p>
          )}
        </div>

        <div className={DetailStyles.detailData}>
          <div onClick={() => setShowRatingModal(true)}>
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
          <p className={DetailStyles.servings}>{recipe.servings}<span>servings</span></p>

          <p className={DetailStyles.likeCount}>
            {displayLiked ? <LikeFilledIcon /> : <LikeUnfilledIcon />}
            {displayLikeCount}
          </p>
        </div>

        <div className={DetailStyles.subtitleDiv}>
          <h2 className={DetailStyles.subtitle}>Ingredients</h2>
          {hasMissingIngredients && (
            <button
              className={ButtonStyles.smallButton}
              onClick={() => setShowShoppingListModal(true)}
              disabled={!loggedUserId}
            >
              Add missing to list
            </button>
          )}
        </div>

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

          {showShoppingListModal && (
            <div
              className={ModalStyles.modalOverlay}
              onClick={() => setShowShoppingListModal(false)}
            >
              <div
                className={ModalStyles.modal}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={ModalStyles.text}>
                  <h2 className={ModalStyles.title}>Missing ingredients</h2>
                  <h3 className={ModalStyles.subtitle}>
                    Add these to your shopping list:
                  </h3>
                  <ul className={ModalStyles.list}>
                    {recipe.ingredients
                      .filter(
                        (i) =>
                          i.hasEnoughInInventory === false &&
                          i.isInShoppingList === false,
                      )
                      .map((i) => (
                        <li key={i.id}>
                          {i.quantity && (
                            <span>
                              {formatQuantity(i.quantity)}
                              {i.unit}{" "}
                            </span>
                          )}
                          {i.ingredientName}
                        </li>
                      ))}
                  </ul>
                </div>

                <div className={ModalStyles.buttons}>
                  <button
                    className={ButtonStyles.secondaryButton}
                    onClick={() => setShowShoppingListModal(false)}
                  >
                    Cancel
                  </button>

                  <button
                    className={ButtonStyles.button}
                    onClick={handleAddMissingToShoppingList}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className={DetailStyles.instructions}>

          <h2 className={DetailStyles.subtitle}>Instructions</h2>
          <ul className={DetailStyles.steps}>
            {recipe.steps.map((step) => (
              <li className={DetailStyles.step} key={step.id}>
                <p className={DetailStyles.stepNumber}>{step.stepNumber}</p>
                <p className={DetailStyles.stepDescription}>{step.description}</p>
              </li>
            ))}
          </ul>

          {hasAllIngredients && (
            <button
              className={ButtonStyles.smallButton}
              onClick={() => setShowCompleteRecipeModal(true)}
              disabled={!loggedUserId}
            >
              Remove used ingredients
            </button>
          )}

        </div>

        {showCompleteRecipeModal && (
          <div
            className={ModalStyles.modalOverlay}
            onClick={() => setShowCompleteRecipeModal(false)}
          >
            <div
              className={ModalStyles.modal}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={ModalStyles.text}>
                <h2 className={ModalStyles.title}>Done cooking?</h2>
                <h3 className={ModalStyles.subtitle}>
                  These ingredients will be removed from your inventory:
                </h3>
                <ul className={ModalStyles.list}>
                  {recipe.ingredients
                    .filter(
                      (i) =>
                        !i.alwaysInStock && i.hasEnoughInInventory === true,
                    )
                    .map((i) => (
                      <li key={i.id}>
                        {i.quantity && (
                          <span>
                            {formatQuantity(i.quantity)}
                            {i.unit}{" "}
                          </span>
                        )}
                        {i.ingredientName}
                      </li>
                    ))}
                </ul>
              </div>

              <div className={ModalStyles.buttons}>
                <button
                  className={ButtonStyles.secondaryButton}
                  onClick={() => setShowCompleteRecipeModal(false)}
                >
                  Cancel
                </button>

                <button
                  className={ButtonStyles.button}
                  onClick={handleRemoveUsedIngredients}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}

        {showRatingModal &&
          (loggedUserId ? (
            <div
              className={ModalStyles.modalOverlay}
              onClick={() => setShowRatingModal(false)}
            >
              <div onClick={(e) => e.stopPropagation()}>
                <RatingModal
                  userId={loggedUserId}
                  recipeId={recipeId}
                  onClose={() => setShowRatingModal(false)}
                  onRated={fetchRecipe}
                />
              </div>
            </div>
          ) : (
            <div
              className={ModalStyles.modalOverlay}
              onClick={() => setShowRatingModal(false)}
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
                    onClick={() => setShowRatingModal(false)}
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

        <CommentPage recipeId={recipeId} loggedUserId={loggedUserId} />
      </div>
    </div>
  );
}
