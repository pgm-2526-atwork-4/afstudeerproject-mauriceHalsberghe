namespace RecipeBackend.Models;

public class Ingredient
{
    public int Id { get; set; } 
    public string? Name { get; set; }
    public bool AlwaysInStock {get; set; } = false;

    public int IngredientTypeId { get; set; }
}