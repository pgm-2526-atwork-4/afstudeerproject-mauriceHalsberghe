using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecipeBackend.Data;
using RecipeBackend.Models;
using RecipeBackend.DTOs;

namespace RecipeBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RecipesController : ControllerBase
{
    private readonly ApiDbContext _context;

    public RecipesController(ApiDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RecipeDto>>> GetRecipes(int? currentUserId)
    {
        var recipes = await _context.Recipes
            .Include(r => r.RecipeIngredients)
            .Include(r => r.Cuisine)
            .Include(r => r.Diet)
            .Include(r => r.User)
            .Select(r => new RecipeDto
            {
                Id = r.Id,
                Title = r.Title,
                ImageUrl = r.ImageUrl,
                Time = r.Time,
                DietId = r.DietId,
                CuisineId = r.CuisineId,
                Diet = r.Diet == null ? null : new DietDto
                {
                    Id = r.Diet.Id,
                    Name = r.Diet.Name
                },
                Cuisine = r.Cuisine == null ? null : new CuisineDto
                {
                    Id = r.Cuisine.Id,
                    Name = r.Cuisine.Name
                },
                User = r.User == null ? null : new UserSummaryDto
                {
                    Id = r.User.Id,
                    Username = r.User.Username,
                    Avatar = r.User.Avatar
                },
                LikeCount = r.Likes.Count(),
                IsLikedByCurrentUser = currentUserId.HasValue && 
                    r.Likes.Any(l => l.UserId == currentUserId.Value),
            })
            .ToListAsync();

        return Ok(recipes);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Recipe>> GetRecipe(int id)
    {
        var recipe = await _context.Recipes
            .Include(r => r.Steps)
            .Include(r => r.User)
            .Include(r => r.RecipeIngredients)
                .ThenInclude(ri => ri.Ingredient)
            .Include(r => r.RecipeIngredients)
                .ThenInclude(ri => ri.QuantityUnit)
            .FirstOrDefaultAsync(r => r.Id == id);
            

        if (recipe == null) return NotFound();

        return recipe;
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<Recipe>> CreateRecipe(Recipe recipe)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        
        _context.Recipes.Add(recipe);
        await _context.SaveChangesAsync();
        return Ok(recipe);
    }
}