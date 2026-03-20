import { Ingredient } from "./IngredientTypes";
import { User } from "./UserTypes";

export type Diet = {
  id: number;
  name: string;
  description: string;
};

export type Cuisine = {
  id: number;
  name: string;
};

export type DishType = {
  id: number;
  name: string;
};

export type Recipe = {
  id: number;
  title: string;
  imageUrl: string;
  time: number;
  likeCount: number;
  isLikedByCurrentUser: boolean;
  averageRating: number;
  diet?: Diet;
  cuisine?: Cuisine;
  dishType?: DishType;
  user?: User;
  missingIngredientCount?: number | null;
};

export type RecipeDetails = {
    id: number;
    title: string;
    imageUrl: string;
    time?: number;
    servings: number;
    diet?: Diet;
    cuisine?: Cuisine;
    dishType?: DishType;
    user?: User;
    steps: Step[];
    ingredients: Ingredient[];
    likeCount: number;
    isLikedByCurrentUser: boolean;
    averageRating?: number;
};

export type Step = {
    id: number;
    stepNumber: number;
    description: string;
}

export enum AllergyType {
    ingredient,
    ingredientType
}

export type Allergy = {
  id: number;
  typeId: number;
  name: string;
  type: AllergyType
};