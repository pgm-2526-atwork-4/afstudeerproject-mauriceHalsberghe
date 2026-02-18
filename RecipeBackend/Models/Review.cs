namespace RecipeBackend.Models;

public class Review
{
    public int Id { get; set; } 
    public required int UserId { get; set; }
    public required int RecipeId { get; set; }
    public required int Rating { get; set; }
}