using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecipeBackend.Data;
using RecipeBackend.Models;

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
    public async Task<ActionResult<IEnumerable<Recipe>>> GetRecipes()
    {
        var recipe = await _context.Recipes
            .Include(r => r.RecipeIngredients)
            .ToListAsync();
            
        if (recipe == null) return NotFound();

        return recipe;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Recipe>> GetRecipe(int id)
    {
        var recipe = await _context.Recipes
            .Include(r => r.Steps)
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