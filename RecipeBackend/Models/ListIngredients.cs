namespace RecipeBackend.Models;

public class ListIngredient
{
    public int Id { get; set; } 
    public required bool Checked { get; set; } = false;
    public required int UserId { get; set; } 
    public required int IngredientId { get; set; }
    public int? Quantity { get; set; }
    public int? QuantityUnitId { get; set; }
}