"use client";

import PrefStyles from '@/app/styles/pages/preferences.module.css';

export type Diet = {
  id: number;
  name: string;
};

type DietSelectorProps = {
  diets: Diet[];
  selectedDiet: number | null;
  onChange: (dietId: number | null) => void;
  disabled: boolean;
};

export default function DietSelector({ diets, selectedDiet, onChange, disabled}: DietSelectorProps) {

  const handleClick = (dietId: number) => {
    if (disabled) return;
    onChange(selectedDiet === dietId ? null : dietId);
  };

  return (
    <div className={PrefStyles.list}>
      {diets.map((diet) => (
        <div key={diet.id} className={PrefStyles.radio}>
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
        </div>
      ))}
    </div>
  );
}