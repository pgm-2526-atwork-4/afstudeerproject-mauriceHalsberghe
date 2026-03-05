using Microsoft.AspNetCore.Mvc;
using RecipeBackend.Data;
using RecipeBackend.Models;
using RecipeBackend.DTOs;
using Microsoft.EntityFrameworkCore;


namespace RecipeBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewController : ControllerBase
{
    private readonly ApiDbContext _context;

    public ReviewController(ApiDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> AddReview(int userId, int recipeId, int rating)
    {
        if (rating < 1 || rating > 10)
        {
            return BadRequest("Rating must be between 1 and 10.");
        }

        var userExists = await _context.Users.AnyAsync(u => u.Id == userId);
        if (!userExists)
        {
            return NotFound("User not found.");
        }

        var recipeExists = await _context.Recipes.AnyAsync(r => r.Id == recipeId);
        if (!recipeExists)
        {
            return NotFound("Recipe not found.");
        }

        var existingReview = await _context.Reviews
            .FirstOrDefaultAsync(r => r.UserId == userId && r.RecipeId == recipeId);

        if (existingReview != null)
        {
            existingReview.Rating = rating;
            _context.Reviews.Update(existingReview);
        }
        else
        {
            var review = new Review
            {
                UserId = userId,
                RecipeId = recipeId,
                Rating = rating
            };

            _context.Reviews.Add(review);
        }

        await _context.SaveChangesAsync();

        return Ok();
    }
}
