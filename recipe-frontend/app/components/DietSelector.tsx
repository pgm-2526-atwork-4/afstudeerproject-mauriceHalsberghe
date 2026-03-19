"use client";

import PrefStyles from '@/app/styles/pages/preferences.module.css';
import { Diet } from '@/types/RecipeTypes';


type Props = {
  diets: Diet[];
  selectedDiet: number | null;
  onChange: (dietId: number | null) => void;
  disabled: boolean;
};

export default function DietSelector({ diets, selectedDiet, onChange, disabled}: Props) {

  const handleClick = (dietId: number | null) => {
    if (disabled) return;
    onChange(selectedDiet === dietId ? null : dietId);
  };

  return (
    <div className={PrefStyles.list}>

      <div className={PrefStyles.radio} onClick={(e) => {e.preventDefault(); handleClick(null);}}>
        <input
          id="diet-none"
          value="none"
          className={PrefStyles.radioInput}
          type="radio"
          disabled={disabled}
          checked={selectedDiet === null}
          onChange={() => {}}
          onClick={() => handleClick(null)}
        />
        <label
          htmlFor="diet-none"
          className={PrefStyles.radioLabel}
          onClick={(e) => {
            e.preventDefault();
            handleClick(null);
          }}
        >
          No Diet
        </label>
        <p className={PrefStyles.dietDesc}>No dietary restrictions</p>
      </div>

      {diets.map((diet) => (
        <div key={diet.id} className={PrefStyles.radio} onClick={() => handleClick(diet.id)}>
          <input
            id={`diet-${diet.id}`}
            value={diet.id}
            className={PrefStyles.radioInput}
            type="radio"
            disabled={disabled}
            checked={selectedDiet === diet.id}
            onChange={() => {}}
            onClick={() => handleClick(diet.id)}
          />
          <label
            htmlFor={`diet-${diet.id}`}
            className={PrefStyles.radioLabel}
            onClick={(e) => {
              e.preventDefault();
              handleClick(diet.id);
            }}
          >
            {diet.name}
          </label>
          <p className={PrefStyles.dietDesc}>{diet.description}</p>
        </div>
      ))}
    </div>
  );
}