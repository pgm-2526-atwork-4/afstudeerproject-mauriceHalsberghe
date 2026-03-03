import Dairy from '@/public/dairy_symbol.svg';
import Seafood from '@/public/fish_symbol.svg';
import Fruit from '@/public/fruit_symbol.svg';
import Grain from '@/public/grain_symbol.svg';
import Herbs from '@/public/herb_symbol.svg';
import Meat from '@/public/meat_symbol.svg';
import Oils from '@/public/oils_symbol.svg';
import Vegetables from '@/public/vegetables_symbol.svg';
import Legume from '@/public/legume_symbol.svg';
import Nuts from '@/public/nuts_symbol.svg';
import Condiments from '@/public/condiment_symbol.svg';
import Eggs from '@/public/eggs_symbol.svg';


export default function IngredientTypeIcon({ id }: { id: number }) {
    let icon = <></>

    switch (id) {
        case 1:
            icon = <Seafood />
            break;
        case 2:
            icon = <Oils />
            break;
        case 3:
            icon = <Dairy />
            break;
        case 4:
            icon = <Herbs />
            break;
        case 5:
            icon = <Vegetables />
            break;
        case 6:
            icon = <Fruit />
            break;
        case 7:
            icon = <Meat />
            break;
        case 8:
            icon = <Grain />
            break;
        case 9:
            icon = <Legume />
            break;
        case 10:
            icon = <Nuts />
            break;
        case 11:
            icon = <Condiments />
            break;
        case 12:
            icon = <Eggs />
            break;
        default:
            break;
    }
    return (
        <div>
            {icon}
        </div>
    )
    
}