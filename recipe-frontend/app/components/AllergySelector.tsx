"use client";

import PrefStyles from '@/app/styles/pages/preferences.module.css';
import { Allergy } from '@/types/RecipeTypes';


type Props = {
  allergies: Allergy[];
  selectedAllergies: number[];
  onToggle: (allergyId: number) => void;
  disabled: boolean;
};

export default function AllergySelector({allergies, selectedAllergies, onToggle, disabled}: Props) {
  return (
    <div className={PrefStyles.list}>
      {allergies.map((allergy) => (
        <div key={allergy.id} className={PrefStyles.checkbox}>
          <input
            id={`allergy-${allergy.id}`}
            className={PrefStyles.checkboxInput}
            type="checkbox"
            disabled={disabled}
            checked={selectedAllergies.includes(allergy.id)}
            onChange={() => onToggle(allergy.id)}
          />
          <label
            htmlFor={`allergy-${allergy.id}`}
            className={PrefStyles.checkboxLabel}
          >
            {allergy.name}
          </label>
        </div>
      ))}
    </div>
  );
}