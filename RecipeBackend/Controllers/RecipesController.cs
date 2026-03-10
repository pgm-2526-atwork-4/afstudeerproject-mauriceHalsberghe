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
            .Include(r => r.Reviews)
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
                    
                AverageRating = r.Reviews.Any()
                    ? Math.Round(r.Reviews.Average(rv => rv.Rating) / 2.0, 1)
                    : (double?)null,
                MissingIngredientCount = currentUserId.HasValue
                    ? r.RecipeIngredients
                        .Count(ri => !_context.InventoryIngredients
                            .Any(ii => ii.UserId == currentUserId.Value && ii.IngredientId == ri.IngredientId))
                    : (int?)null,
            })
            .ToListAsync();

        return Ok(recipes);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<RecipeDetailDto>> GetRecipe(int id, int? currentUserId)
    {
        var recipe = await _context.Recipes
            .Where(r => r.Id == id)
            .Select(r => new RecipeDetailDto
            {
                Id = r.Id,
                Title = r.Title,
                ImageUrl = r.ImageUrl,
                Time = r.Time,

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

                Steps = r.Steps
                    .OrderBy(s => s.StepNumber)
                    .Select(s => new StepDto
                    {
                        Id = s.Id,
                        StepNumber = s.StepNumber,
                        Description = s.Description
                    }).ToList(),

                Ingredients = r.RecipeIngredients
                    .Select(ri => new RecipeIngredientDto
                    {
                        Id = ri.Id,
                        Quantity = ri.Quantity,
                        Unit = ri.QuantityUnit != null ? ri.QuantityUnit.ShortName : null,
                        IngredientName = ri.Ingredient.Name,
                        IsInInventory = currentUserId.HasValue
                            ? _context.InventoryIngredients.Any(ii =>
                                ii.UserId == currentUserId.Value &&
                                ii.IngredientId == ri.IngredientId)
                            : null
                    }).ToList(),

                LikeCount = r.Likes.Count(),

                AverageRating = r.Reviews.Any()
                    ? Math.Round(r.Reviews.Average(rv => rv.Rating) / 2.0, 1)
                    : (double?)null,
            })
            .FirstOrDefaultAsync();

        if (recipe == null)
            return NotFound();

        return Ok(recipe);
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<Recipe>> CreateRecipe(CreateRecipeDto dto)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var recipe = new Recipe
        {
            Title = dto.Title,
            ImageUrl = dto.ImageUrl,
            Time = dto.Time,
            DietId = dto.DietId,
            CuisineId = dto.CuisineId,
            UserId = userId,
            Steps = dto.Steps.Select(s => new Step
            {
                StepNumber = s.StepNumber,
                Description = s.Description,
            }).ToList(),
            RecipeIngredients = dto.RecipeIngredients.Select(i => new RecipeIngredient
            {
                IngredientId = i.IngredientId,
                Quantity = i.Quantity,
                QuantityUnitId = i.QuantityUnitId,
            }).ToList(),
        };

        _context.Recipes.Add(recipe);
        await _context.SaveChangesAsync();
        return Ok(recipe);
    }

    
    [HttpPost("{id}/image")]
    public async Task<IActionResult> UploadRecipeImage(int id, IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded.");

        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
        var extension = Path.GetExtension(file.FileName).ToLower();
        if (!allowedExtensions.Contains(extension))
            return BadRequest("Invalid file type.");

        var recipe = await _context.Recipes.FindAsync(id);
        if (recipe == null)
            return NotFound("Recipe not found.");

        var fileName = $"{Guid.NewGuid()}{extension}";

        var uploadPath = Path.Combine(
            Directory.GetCurrentDirectory(),
            "wwwroot", "uploads", "recipe-images"
        );

        if (!Directory.Exists(uploadPath))
            Directory.CreateDirectory(uploadPath);

        var filePath = Path.Combine(uploadPath, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        recipe.ImageUrl = fileName;
        await _context.SaveChangesAsync();

        return Ok(new { imageUrl = recipe.ImageUrl });
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateRecipe(int id, CreateRecipeDto dto)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var recipe = await _context.Recipes
            .Include(r => r.Steps)
            .Include(r => r.RecipeIngredients)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (recipe == null)
            return NotFound();

        if (recipe.UserId != userId)
            return Forbid();

        recipe.Title = dto.Title;
        recipe.ImageUrl = dto.ImageUrl;
        recipe.Time = dto.Time;
        recipe.DietId = dto.DietId;
        recipe.CuisineId = dto.CuisineId;

        _context.Steps.RemoveRange(recipe.Steps);
        _context.RecipeIngredients.RemoveRange(recipe.RecipeIngredients);

        recipe.Steps = dto.Steps.Select(s => new Step
        {
            StepNumber = s.StepNumber,
            Description = s.Description,
        }).ToList();

        recipe.RecipeIngredients = dto.RecipeIngredients.Select(i => new RecipeIngredient
        {
            IngredientId = i.IngredientId,
            Quantity = i.Quantity,
            QuantityUnitId = i.QuantityUnitId,
        }).ToList();

        await _context.SaveChangesAsync();
        return Ok(recipe);
    }
}