namespace RecipeBackend.DTOs;

public class CreateReviewDto
{
    public int UserId { get; set; }
    public int RecipeId { get; set; }
    public int Rating { get; set; }
}