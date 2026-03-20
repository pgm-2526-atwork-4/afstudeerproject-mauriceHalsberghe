"use client";

import PrefStyles from '@/app/styles/pages/preferences.module.css';
import ModalStyles from '@/app/styles/components/modal.module.css';
import ButtonStyles from '@/app/styles/components/button.module.css';

import { Allergy } from '@/types/RecipeTypes';
import { useState } from 'react';
import IngredientSearch, { IngredientOption } from '@/app/components/IngredientSearch';


type Props = {
  allergies: Allergy[];
  selectedAllergies: number[];
  onToggle: (allergyId: number) => void;
  onAddCustomAllergy: (ingredient: IngredientOption) => void;
  onRemoveCustomAllergy: (id: number) => void;
  customAllergies: IngredientOption[];
  disabled: boolean;
};


export default function AllergySelector({allergies, selectedAllergies, onToggle, onAddCustomAllergy, onRemoveCustomAllergy, customAllergies, disabled}: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<IngredientOption | null>(null);

  function handleSave() {
    if (!selectedIngredient) return;
    onAddCustomAllergy(selectedIngredient);
    setSelectedIngredient(null);
    setModalOpen(false);
  }

  function handleCancel() {
    setSelectedIngredient(null);
    setModalOpen(false);
  }

  return (
    <div className={PrefStyles.listAllergy}>
      {allergies.map((allergy) => (
        <div key={allergy.id} className={PrefStyles.checkbox} onClick={() => onToggle(allergy.id)}>
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

      {customAllergies.map((ingredient) => (
        <div key={`custom-${ingredient.value}`} className={PrefStyles.checkbox} onClick={() => onRemoveCustomAllergy(ingredient.value)}>
            <input
                id={`custom-allergy-${ingredient.value}`}
                className={PrefStyles.checkboxInput}
                type="checkbox"
                checked={true}
                onChange={() => onRemoveCustomAllergy(ingredient.value)}
                disabled={disabled}
            />
            <label
                htmlFor={`custom-allergy-${ingredient.value}`}
                className={PrefStyles.checkboxLabel}
            >
                {ingredient.label}
            </label>
        </div>
      ))}

      {!disabled && (
        <button className={PrefStyles.AddAllergyButton} onClick={() => setModalOpen(true)}>
          Other...
        </button>
      )}

      {modalOpen && (
        <div className={ModalStyles.modalOverlay}>
          <div className={ModalStyles.modal}>
            <h2 className={ModalStyles.title}>Add custom allergy</h2>
            <IngredientSearch
              value={selectedIngredient}
              onIngredientChange={setSelectedIngredient}
              placeholder="Search ingredient..."
            />
            <div className={ModalStyles.buttons}>
              <button className={ButtonStyles.button} onClick={handleCancel}>Cancel</button>
              <button className={ButtonStyles.button} onClick={handleSave} disabled={!selectedIngredient}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}