namespace RecipeBackend.Models;

public class Comment
{
    public int Id { get; set; } 
    public required int UserId { get; set; }
    public required int RecipeId { get; set; }
    public required string Message { get; set; }
    public int? CommentId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; }
}