import EmptyViewStyles from '@/app/styles/components/emptyview.module.css';
import ButtonStyles from '@/app/styles/components/button.module.css';

import ProfileIcon from '@/public/profile.svg';
import RecipeIcon from '@/public/chefhat.svg';
import IngredientIcon from '@/public/apple.svg';
import CartIcon from '@/public/cart.svg';

import Link from "next/link";


type Props = {
    title: string;
    text?: string;
    btnText?: string;
    btnUrl?: string;
    icon?: string; 
};

export default function EmptyView(view : Props) {

    let icon = <></>

    if(view.icon) {
        if(view.icon === 'profile') {
            icon = <ProfileIcon className={EmptyViewStyles.icon} />
        } else if (view.icon === 'recipe') {
            icon = <RecipeIcon className={EmptyViewStyles.icon} />
        } else if (view.icon === 'ingredient') {
            icon = <IngredientIcon className={EmptyViewStyles.icon} />
        } else if (view.icon === 'cart') {
            icon = <CartIcon className={EmptyViewStyles.icon} />
        }
    }

    return (
        <main className={EmptyViewStyles.page}>
            {icon}
            <div className={EmptyViewStyles.textDiv}>
                <h1 className={EmptyViewStyles.title}>{view.title}</h1>
                {view.text && <p className={EmptyViewStyles.text}>{view.text}</p> }
            </div>
            {view.btnText && view.btnUrl && <Link href={view.btnUrl} className={ButtonStyles.button}>{view.btnText}</Link> }
            
        </main>
    )
}