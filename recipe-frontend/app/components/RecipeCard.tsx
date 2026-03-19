import { API_URL } from "@/lib/api";

import Image from 'next/image';

import RecipeCardStyles from '@/app/styles/components/recipecard.module.css';
import Link from 'next/link';
import LikeButton from "./LikeButton";
import { useContext, useState } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { Recipe } from "@/types/RecipeTypes";

import LikeFilledIcon from '@/public/like_filled.svg';
import LikeUnfilledIcon from '@/public/like_unfilled.svg';

type Props = {
  recipe: Recipe;
  onUnlike?: (recipeId: number) => void; 
};

function RecipeCard({ recipe, onUnlike }: Props) {
  const auth = useContext(AuthContext);
  const [likeCount, setLikeCount] = useState(recipe.likeCount);
  const [liked, setLiked] = useState(recipe.isLikedByCurrentUser);

  return (
    <div className={RecipeCardStyles.card}>
      <Link href={`/recipes/${recipe.id}/${recipe.title.replace(/\s+/g, '-').toLowerCase()}`}>
        <Image
          className={RecipeCardStyles.image}
          width={400}
          height={200}
          src={recipe.imageUrl === '/recipe.jpg' ? '/recipe.jpg' : `${API_URL}/uploads/recipe-images/${recipe.imageUrl}` }
          alt={recipe.title}
        />
        <div className={RecipeCardStyles.text}>
          { recipe.user && 
            <Image 
              className={RecipeCardStyles.avatar} 
              width={48} 
              height={48} 
              alt={recipe.user.username}
              src={recipe.user.avatar ? `${API_URL}/uploads/avatars/${recipe.user.avatar}` : '/avatar.svg'} 
            />
          }
          <h2 className={RecipeCardStyles.title}>{recipe.title}</h2>
          <div className={RecipeCardStyles.detailData}>
            {recipe.averageRating && 
              <p className={RecipeCardStyles.rating}>{recipe.averageRating}</p>
            }
            <p className={RecipeCardStyles.time}>{recipe.time} min</p>

            {recipe.missingIngredientCount != null && (
              recipe.missingIngredientCount === 0
                ? <p className={RecipeCardStyles.ingredient}>In stock</p>
                : <p className={RecipeCardStyles.ingredientMissing}>{recipe.missingIngredientCount} missing</p>
            )}
            <p className={RecipeCardStyles.likeCount}>
              {liked ? <LikeFilledIcon /> : <LikeUnfilledIcon />}
              {likeCount}
            </p>
          </div>
          <div className={RecipeCardStyles.tags}>
            { recipe.diet && <p className={RecipeCardStyles.tag}>{recipe.diet.name}</p>}
            { recipe.cuisine && <p className={RecipeCardStyles.tag}>{recipe.cuisine.name}</p> }
            { recipe.dishType && <p className={RecipeCardStyles.tag}>{recipe.dishType.name}</p> }
          </div>
        </div>
      </Link>
      <LikeButton
        recipeId={recipe.id}
        initialLiked={recipe.isLikedByCurrentUser}
        initialLikeCount={recipe.likeCount}
        userId={auth?.user?.id}
        onUnlike={() => onUnlike?.(recipe.id)}
        onLikeCountChange={setLikeCount}
        onLikedChange={setLiked}
      />
    </div>
  );
}

export default RecipeCard;