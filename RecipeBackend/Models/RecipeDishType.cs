namespace RecipeBackend.Models;

public class RecipeDishType
{
    public int Id { get; set; } 
    
    public int RecipeId { get; set; }
    public Recipe Recipe { get; set; } = null!;

    public int DishTypeId { get; set; }
    public DishType DishType { get; set; } = null!;
}