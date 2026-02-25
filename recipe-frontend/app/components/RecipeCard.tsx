import Image from 'next/image';

import RecipeCardStyles from '@/app/styles/components/recipecard.module.css';
import Link from 'next/link';

type Diet = {
  id: number;
  name: string;
};

type Cuisine = {
  id: number;
  name: string;
};

type User = {
  id: number;
  username: string;
  avatar: string;
};

type Recipe = {
  id: number;
  title: string;
  imageUrl: string;
  time: number;
  diet?: Diet;
  cuisine?: Cuisine;
  user?: User;
};

type Props = {
  recipe: Recipe;
};

function RecipeCard({ recipe }: Props) {
  return (
    <Link className={RecipeCardStyles.card} href={`/recipes/${recipe.id}/${recipe.title.replace(/\s+/g, '-').toLowerCase()}`}>
      <Image
        className={RecipeCardStyles.image}
        width={200}
        height={100}
        src={`http://localhost:5041/uploads/recipe-images/${recipe.imageUrl}`}
        alt={recipe.title}
      />
      <div className={RecipeCardStyles.text}>
        { recipe.user && 
          <Image 
            className={RecipeCardStyles.avatar} 
            width={40} 
            height={40} 
            alt={recipe.user.username}
            src={recipe.user.avatar ? `http://localhost:5041/uploads/avatars/${recipe.user.avatar}` : '/avatar.svg'} 
          />
        }
        <h2 className={RecipeCardStyles.title}>{recipe.title}</h2>
        <p className={RecipeCardStyles.time}>{recipe.time} min</p>
        <div className={RecipeCardStyles.tags}>
          { recipe.diet && <p className={RecipeCardStyles.tag}>{recipe.diet.name}</p>}
          { recipe.cuisine && <p className={RecipeCardStyles.tag}>{recipe.cuisine.name}</p> }
        </div>
      </div>
    </Link>
  );
}

export default RecipeCard;