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