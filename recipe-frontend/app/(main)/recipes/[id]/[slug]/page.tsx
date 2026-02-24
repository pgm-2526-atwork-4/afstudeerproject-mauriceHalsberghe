'use client'

import { useParams } from 'next/navigation'

export default function RecipeDetail() {
    const params = useParams();
    const id = params.id;

    return (
        <div>
            {id}
            <h1>Recipe Detail</h1>
        </div>
    );
}