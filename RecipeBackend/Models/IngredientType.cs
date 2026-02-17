namespace RecipeBackend.Models;

public class IngredientType
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;

    public List<Ingredient> Ingredients { get; set; } = new();
}