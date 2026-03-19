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
    public async Task<ActionResult<PaginatedRecipesDto>> GetRecipes(
        int? currentUserId,
        int page = 1,
        int pageSize = 4,
        string? search = null,
        int? dietId = null,
        int? cuisineId = null,
        bool onlyUsers = false,
        bool onlyInStock = false,
        int sortBy = 3,
        bool onlyLiked = false,
        bool filterByDiet = false,  
        bool filterByAllergens = false) 
    {
        var query = _context.Recipes
            .Include(r => r.RecipeIngredients)
                .ThenInclude(ri => ri.Ingredient)
            .Include(r => r.Cuisine)
            .Include(r => r.Diet)
            .Include(r => r.DishType)
            .Include(r => r.User)
            .Include(r => r.Reviews)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(r => r.Title != null && r.Title.ToLower().Contains(search.ToLower()));

        if (dietId.HasValue && dietId > 0)
            query = query.Where(r => r.DietId == dietId);

        if (cuisineId.HasValue && cuisineId > 0)
            query = query.Where(r => r.CuisineId == cuisineId);

        if (onlyUsers)
            query = query.Where(r => r.UserId != null);
        
        if (onlyLiked && currentUserId.HasValue)
            query = query.Where(r => r.Likes.Any(l => l.UserId == currentUserId.Value));

        if (filterByDiet && currentUserId.HasValue)
        {
            var user = await _context.Users.FindAsync(currentUserId.Value);
            if (user?.DietId != null)
                query = query.Where(r => r.DietId == user.DietId);
        }

        if (filterByAllergens && currentUserId.HasValue)
        {
            var allergies = await _context.Allergies
                .Where(a => a.UserId == currentUserId.Value)
                .ToListAsync();

            var blockedIngredientIds = allergies
                .Where(a => a.IngredientId != null)
                .Select(a => a.IngredientId!.Value)
                .ToHashSet();

            var blockedIngredientTypeIds = allergies
                .Where(a => a.IngredientTypeId != null)
                .Select(a => a.IngredientTypeId!.Value)
                .ToHashSet();

            query = query.Where(r => r.RecipeIngredients.All(ri =>
                !blockedIngredientIds.Contains(ri.IngredientId) &&
                (ri.Ingredient == null || !blockedIngredientTypeIds.Contains(ri.Ingredient.IngredientTypeId))
            ));
        }

        var projected = query.Select(r => new RecipeDto
        {
            Id = r.Id,
            Title = r.Title,
            ImageUrl = r.ImageUrl,
            Time = r.Time,
            DietId = r.DietId,
            CuisineId = r.CuisineId,
            DishTypeId = r.DishTypeId,
            Diet = r.Diet == null ? null : new DietDto { Id = r.Diet.Id, Name = r.Diet.Name },
            Cuisine = r.Cuisine == null ? null : new CuisineDto { Id = r.Cuisine.Id, Name = r.Cuisine.Name },
            DishType = r.DishType == null ? null : new DishTypeDto { Id = r.DishType.Id, Name = r.DishType.Name },
            User = r.User == null ? null : new UserSummaryDto { Id = r.User.Id, Username = r.User.Username, Avatar = r.User.Avatar },
            LikeCount = r.Likes.Count(),
            IsLikedByCurrentUser = currentUserId.HasValue && r.Likes.Any(l => l.UserId == currentUserId.Value),
            AverageRating = r.Reviews.Any()
                ? Math.Round(r.Reviews.Average(rv => rv.Rating) / 2.0, 1)
                : (double?)null,
            MissingIngredientCount = currentUserId.HasValue
                ? r.RecipeIngredients.Count(ri => !_context.InventoryIngredients
                    .Any(ii => ii.UserId == currentUserId.Value && ii.IngredientId == ri.IngredientId))
                : (int?)null,
            RawAverageRating = r.Reviews.Any()
                ? r.Reviews.Average(rv => (double)rv.Rating) / 2.0
                : 0,
        });

        projected = sortBy switch
        {
            1 => projected.OrderByDescending(r => r.RawAverageRating),
            2 => projected.OrderBy(r => r.Title),
            3 => projected.OrderBy(r => r.MissingIngredientCount ?? int.MaxValue)
                .ThenByDescending(r => r.RawAverageRating),
            _ => projected
        };

        if (onlyInStock)
            projected = projected.Where(r => r.MissingIngredientCount == 0);

        var totalCount = await projected.CountAsync();

        var recipes = await projected
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();


        return Ok(new PaginatedRecipesDto { Recipes = recipes, TotalCount = totalCount });
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
                        IngredientId = ri.IngredientId,
                        Quantity = ri.Quantity,
                        QuantityUnitId = ri.QuantityUnitId,
                        Unit = ri.QuantityUnit != null ? ri.QuantityUnit.ShortName : null,
                        IngredientName = ri.Ingredient.Name,

                        HasEnoughInInventory = currentUserId.HasValue
                            ? (ri.Ingredient.AlwaysInStock
                                ? _context.InventoryIngredients
                                    .Any(ii => ii.UserId == currentUserId.Value && ii.IngredientId == ri.IngredientId)
                                : _context.InventoryIngredients
                                    .Where(ii => ii.UserId == currentUserId.Value && ii.IngredientId == ri.IngredientId)
                                    .Sum(ii => ii.Quantity ?? 0) >= (ri.Quantity ?? 0))
                            : null,

                        HasPartialInInventory = currentUserId.HasValue
                            ? (!ri.Ingredient.AlwaysInStock &&
                                _context.InventoryIngredients
                                    .Where(ii => ii.UserId == currentUserId.Value && ii.IngredientId == ri.IngredientId)
                                    .Sum(ii => ii.Quantity ?? 0) > 0 &&
                                _context.InventoryIngredients
                                    .Where(ii => ii.UserId == currentUserId.Value && ii.IngredientId == ri.IngredientId)
                                    .Sum(ii => ii.Quantity ?? 0) < (ri.Quantity ?? 0))
                            : null,

                        MissingAmount = currentUserId.HasValue && !ri.Ingredient.AlwaysInStock
                            ? Math.Max(0, (ri.Quantity ?? 0) - _context.InventoryIngredients
                                .Where(ii => ii.UserId == currentUserId.Value && ii.IngredientId == ri.IngredientId)
                                .Sum(ii => ii.Quantity ?? 0))
                            : null,

                        IsInShoppingList = currentUserId.HasValue
                            ? _context.ListIngredients.Any(ii =>
                                ii.UserId == currentUserId.Value &&
                                ii.IngredientId == ri.IngredientId)
                            : null,
                        AlwaysInStock = ri.Ingredient.AlwaysInStock
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

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRecipe(int id)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var recipe = await _context.Recipes
            .FirstOrDefaultAsync(r => r.Id == id);

        if (recipe == null)
            return NotFound();

        if (recipe.UserId != userId)
            return Forbid();

        _context.Recipes.Remove(recipe);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("slugs")]
    public async Task<ActionResult<IEnumerable<object>>> GetSlugs()
    {
        return await _context.Recipes
            .Select(r => new { 
                id = r.Id.ToString(), 
                slug = r.Title.ToLower().Replace(" ", "-") 
            })
            .ToListAsync();
    }
}