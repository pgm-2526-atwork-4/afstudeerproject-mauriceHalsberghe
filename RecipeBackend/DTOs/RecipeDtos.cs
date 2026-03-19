namespace RecipeBackend.DTOs;

public class PaginatedRecipesDto
{
    public List<RecipeDto> Recipes { get; set; } = new();
    public int TotalCount { get; set; }
}

public class RecipeDto
{
    public int Id { get; set; }
    public string? Title { get; set; }
    public string? ImageUrl { get; set; }
    public int? Time { get; set; }
    public int? DietId { get; set; }
    public int? CuisineId { get; set; }
    public int? DishTypeId { get; set; }

    public DietDto? Diet { get; set; }
    public CuisineDto? Cuisine { get; set; }
    public DishTypeDto? DishType { get; set; }

    public UserSummaryDto? User { get; set; }

    public int LikeCount { get; set; }
    public bool IsLikedByCurrentUser { get; set; }
    public double RawAverageRating { get; set; }
    public double? AverageRating { get; set; }

    public int? MissingIngredientCount { get; set; }

}

public class UserSummaryDto
{
    public int Id { get; set; }
    public string? Username { get; set; }
    public string? Avatar { get; set; }
}

public class DietDto
{
    public int Id { get; set; }
    public string? Name { get; set; }
    public string? Description { get; set; }
}

public class CuisineDto
{
    public int Id { get; set; }
    public string? Name { get; set; }
}

public class DishTypeDto
{
    public int Id { get; set; }
    public string? Name { get; set; }
}
