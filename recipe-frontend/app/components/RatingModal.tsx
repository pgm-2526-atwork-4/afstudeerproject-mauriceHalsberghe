import { useState } from "react"
import RatingStars from "./RatingStars"

import RatingModalStyles from '@/app/styles/components/ratingmodal.module.css'
import ButtonStyles from '@/app/styles/components/button.module.css'


export default function RatingModal() {
  const [amount, setAmount] = useState(0);
  const dbValue = amount * 2;

  return (
    <div className={RatingModalStyles.modal}>

      <div className={RatingModalStyles.text}>
        <h2 className={RatingModalStyles.title}>Rate this recipe</h2>
        <p className={RatingModalStyles.subtitle}>What did you think of this recipe?</p>
      </div>

      <RatingStars amount={amount} interactive onRate={setAmount} />

      <div className={RatingModalStyles.buttons}>
        <button className={ButtonStyles.secondaryButton}>Cancel</button>
        <button className={ButtonStyles.button}>Submit</button>
      </div>

    </div>
  )
}