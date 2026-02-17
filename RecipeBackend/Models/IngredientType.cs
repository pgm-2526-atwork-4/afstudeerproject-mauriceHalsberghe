namespace RecipeBackend.Models;

public class IngredientType
{
    public int Id { get; set; }
    public required string Name { get; set; }

    public List<Ingredient> Ingredients { get; set; } = new();
}