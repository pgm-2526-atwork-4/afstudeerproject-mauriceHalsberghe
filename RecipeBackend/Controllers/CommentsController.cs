using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using RecipeBackend.Data;
using RecipeBackend.Models;
using System.Security.Claims;
 
namespace RecipeBackend.Controllers;
 
[ApiController]
[Route("api/[controller]")]
public class CommentsController : ControllerBase
{
    private readonly ApiDbContext _context;
 
    public CommentsController(ApiDbContext context)
    {
        _context = context;
    }
 
    [HttpGet("recipe/{recipeId}")]
    public async Task<ActionResult<IEnumerable<CommentDto>>> GetCommentsByRecipe(int recipeId)
    {
        return await _context.Comments
            .Where(c => c.RecipeId == recipeId)
            .OrderBy(c => c.CreatedAt)
            .Include(c => c.User)
            .Select(c => new CommentDto
            {
                Id = c.Id,
                Message = c.Message,
                CreatedAt = c.CreatedAt,
                RecipeId = c.RecipeId,
                CommentId = c.CommentId,
                User = new CommentUserDto
                {
                    Id = c.User.Id,
                    Username = c.User.Username,
                    Avatar = c.User.Avatar
                }
            })
            .ToListAsync();
    }
 
    [Authorize]
    [HttpPost]
    public async Task<ActionResult<Comment>> PostComment(CreateCommentDto dto)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
            return Unauthorized();
 
        var userId = int.Parse(userIdClaim);
 
        if (dto.CommentId.HasValue)
        {
            var parentExists = await _context.Comments.AnyAsync(c => c.Id == dto.CommentId.Value);
            if (!parentExists)
                return BadRequest("Parent comment not found.");
        }
 
        var comment = new Comment
        {
            UserId    = userId,
            RecipeId  = dto.RecipeId,
            Message   = dto.Message,
            CommentId = dto.CommentId,
        };
 
        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();
 
        return CreatedAtAction(nameof(GetComment), new { id = comment.Id }, comment);
    }
 
    [HttpGet("{id}")]
    public async Task<ActionResult<Comment>> GetComment(int id)
    {
        var comment = await _context.Comments.FindAsync(id);
        if (comment == null)
            return NotFound();
 
        return comment;
    }
 
    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> EditComment(int id, EditCommentDto dto)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
            return Unauthorized();
 
        var userId = int.Parse(userIdClaim);
 
        var comment = await _context.Comments.FindAsync(id);
        if (comment == null)
            return NotFound();
 
        if (comment.UserId != userId)
            return Forbid();
 
        comment.Message = dto.Message;
        await _context.SaveChangesAsync();
 
        return NoContent();
    }
}