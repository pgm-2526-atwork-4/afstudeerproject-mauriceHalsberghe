namespace RecipeBackend.Models;

public class InventoryIngredient
{
    public int Id { get; set; } 
    public required int UserId { get; set; } 
    public int? Quantity { get; set; }
    
    public int? QuantityUnitId { get; set; }
    public QuantityUnit QuantityUnit { get; set; }

    public required int IngredientId { get; set; }
    public Ingredient Ingredient { get; set; }
}