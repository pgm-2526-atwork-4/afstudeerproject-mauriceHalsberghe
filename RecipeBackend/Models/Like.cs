namespace RecipeBackend.Models;

public class Like
{
    public int Id { get; set; } 
    public required int UserId { get; set; }
    public required int RecipeId { get; set; }
}