namespace RecipeBackend.Models;

public class Recipe
{
    public int Id { get; set; } 
    public string? Title { get; set; }
    public string? ImageUrl { get; set; }
    public int? Time { get; set; }

    public int? DietId { get; set; }
    public int? CuisineId { get; set; }
    public int? DishTypeId { get; set; }

    public Diet? Diet { get; set; }
    public Cuisine? Cuisine { get; set; }
    public DishType? DishType { get; set; }

    public int? Servings { get; set; }

    public List<Step> Steps { get; set; } = new();
    public List<RecipeIngredient> RecipeIngredients { get; set; } = new();

    public int? UserId { get; set; }
    public User? User { get; set; }

    public ICollection<Like> Likes { get; set; } = new List<Like>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
}