namespace RecipeBackend.Models;

public class RecipeIngredient
{
    public int Id { get; set; }

    public int? Quantity { get; set; }
    public int? QuantityUnitId { get; set; }

    public int RecipeId { get; set; }
    public int IngredientId { get; set; }
}