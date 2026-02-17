namespace RecipeBackend.Models;

public class Recipe
{
    public int Id { get; set; } 
    public string? Title { get; set; }
    public string? ImageUrl { get; set; }
    public int? Time { get; set; }

    public List<Step> Steps { get; set; } = new();
    public List<RecipeIngredient> RecipeIngredients { get; set; } = new();
}