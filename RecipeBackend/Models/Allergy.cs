namespace RecipeBackend.Models;

public class Allergy
{
    public int Id { get; set; } 
    public required int UserId { get; set; } 
    public int? IngredientId { get; set; }
    public int? IngredientTypeId { get; set; }
}