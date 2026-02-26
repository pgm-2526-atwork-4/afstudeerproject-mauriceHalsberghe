using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecipeBackend.Data;
using RecipeBackend.Models;

namespace RecipeBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LikesController : ControllerBase
{
    private readonly ApiDbContext _context;

    public LikesController(ApiDbContext context)
    {
        _context = context;
    }

    // GET: api/likes/recipe/5
    [HttpGet("recipe/{recipeId}")]
    public async Task<ActionResult<IEnumerable<Like>>> GetLikesByRecipe(int recipeId)
    {
        var likes = await _context.Likes
            .Where(l => l.RecipeId == recipeId)
            .ToListAsync();

        if (!likes.Any())
            return NotFound("No likes found");

        return likes;
    }

    // GET: api/likes/user/3
    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<Like>>> GetLikesByUser(int userId)
    {
        var likes = await _context.Likes
            .Where(l => l.UserId == userId)
            .ToListAsync();

        if (!likes.Any())
            return NotFound("No likes found");

        return likes;
    }

    // POST: api/likes
    [HttpPost]
    public async Task<ActionResult<Like>> AddLike(Like like)
    {
        // Prevent duplicate likes
        var existingLike = await _context.Likes
            .FirstOrDefaultAsync(l =>
                l.UserId == like.UserId &&
                l.RecipeId == like.RecipeId);

        if (existingLike != null)
            return BadRequest("User already liked this recipe.");

        _context.Likes.Add(like);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetLikesByRecipe),
            new { recipeId = like.RecipeId },
            like);
    }

    // DELETE: api/likes
    [HttpDelete]
    public async Task<IActionResult> RemoveLike(int userId, int recipeId)
    {
        var like = await _context.Likes
            .FirstOrDefaultAsync(l =>
                l.UserId == userId &&
                l.RecipeId == recipeId);

        if (like == null)
            return NotFound("Like not found.");

        _context.Likes.Remove(like);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}