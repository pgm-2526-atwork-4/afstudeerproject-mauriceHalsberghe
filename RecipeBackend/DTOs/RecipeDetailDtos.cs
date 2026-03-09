namespace RecipeBackend.DTOs;

public class RecipeDetailDto
{
    public int Id { get; set; }
    public string? Title { get; set; }
    public string? ImageUrl { get; set; }
    public int? Time { get; set; }

    public DietDto? Diet { get; set; }
    public CuisineDto? Cuisine { get; set; }
    public UserSummaryDto? User { get; set; }

    public List<StepDto> Steps { get; set; } = new();
    public List<RecipeIngredientDto> Ingredients { get; set; } = new();

    public int LikeCount { get; set; }
    public double? AverageRating { get; set; }
}

public class StepDto
{
    public int Id { get; set; }
    public int StepNumber { get; set; }
    public string? Description { get; set; }
}

public class RecipeIngredientDto
{
    public int Id { get; set; }
    public int? Quantity { get; set; }
    public string? Unit { get; set; }
    public string IngredientName { get; set; } = "";
    public bool? IsInInventory { get; set; }
}