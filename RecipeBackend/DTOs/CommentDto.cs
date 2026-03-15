public class CreateCommentDto
{
    public required int RecipeId { get; set; }
    public required string Message { get; set; }
    public int? CommentId { get; set; }
}
 
public class EditCommentDto
{
    public required string Message { get; set; }
}

public class CommentDto
{
    public int Id { get; set; }
    public string Message { get; set; }
    public DateTime CreatedAt { get; set; }
    public int RecipeId { get; set; }
    public CommentUserDto User { get; set; }
    public int? CommentId { get; set; }
}

public class CommentUserDto
{
    public int Id { get; set; }
    public string Username { get; set; }
    public string Avatar { get; set; }
}