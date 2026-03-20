namespace RecipeBackend.DTOs;

public class CreateRecipeIngredientDto
{
    public int IngredientId { get; set; }
    public decimal? Quantity { get; set; }
    public int? QuantityUnitId { get; set; }
}

public class CreateStepDto
{
    public int StepNumber { get; set; }
    public string? Description { get; set; }
}

public class CreateRecipeDto
{
    public string? Title { get; set; }
    public string? ImageUrl { get; set; }
    public int? Time { get; set; }
    public int? Servings { get; set; }
    public int? DietId { get; set; }
    public int? CuisineId { get; set; }
    public int? DishTypeId { get; set; }
    public List<CreateStepDto> Steps { get; set; } = new();
    public List<CreateRecipeIngredientDto> RecipeIngredients { get; set; } = new();
}