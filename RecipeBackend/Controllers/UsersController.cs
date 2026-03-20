using Microsoft.AspNetCore.Mvc;
using RecipeBackend.Data;
using RecipeBackend.DTOs;
using RecipeBackend.Models;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;


namespace RecipeBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly ApiDbContext _context;

    public UsersController(ApiDbContext context)
    {
        _context = context;
    }

    [HttpGet("usernames")]
    public async Task<ActionResult<IEnumerable<string>>> GetUsernames()
    {
        return await _context.Users
            .Select(u => u.Username)
            .ToListAsync();
    }

    [Authorize]
    [HttpPost("preferences")]
    public async Task<IActionResult> UpdatePreferences(UpdateUserPreferencesDto dto)
    {
        var user = await _context.Users.FindAsync(GetUserIdFromToken());
        if (user == null) return NotFound();

        user.DietId = dto.DietId;
        user.FilterByDiet = dto.FilterByDiet;
        user.FilterByAllergens = dto.FilterByAllergens;

        var existingAllergies = _context.Allergies.Where(a => a.UserId == user.Id);
        _context.Allergies.RemoveRange(existingAllergies);

        var newAllergies =
            dto.IngredientAllergyIds.Select(id => new Allergy { UserId = user.Id, IngredientId = id })
            .Concat(
            dto.IngredientTypeAllergyIds.Select(id => new Allergy { UserId = user.Id, IngredientTypeId = id }));

        _context.Allergies.AddRange(newAllergies);

        await _context.SaveChangesAsync();
        return Ok();
    }

    [Authorize]
    [HttpGet("{userId}/preferences")]
    public async Task<IActionResult> GetPreferences(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();

        var allergies = await _context.Allergies
            .Where(a => a.UserId == userId)
            .ToListAsync();

        return Ok(new
        {
            DietId = user.DietId,
            FilterByDiet = user.FilterByDiet,
            FilterByAllergens = user.FilterByAllergens,
            IngredientAllergyIds = allergies
                .Where(a => a.IngredientId != null)
                .Select(a => a.IngredientId),
            IngredientTypeAllergyIds = allergies
                .Where(a => a.IngredientTypeId != null)
                .Select(a => a.IngredientTypeId)
        });
    }

    private int GetUserIdFromToken()
    {
        var claim =
            User.FindFirst(ClaimTypes.NameIdentifier) ??
            User.FindFirst("sub") ??
            User.FindFirst("id");

        if (claim == null)
            throw new UnauthorizedAccessException("User ID claim not found in token");

        return int.Parse(claim.Value);
    }

    [HttpGet("{username}/recipes")]
    public async Task<IActionResult> GetRecipesByUsername(
        string username,
        int? currentUserId,
        int page = 1,
        int pageSize = 6,
        string? search = null,
        int sortBy = 1,
        int? dietId = null,
        int? cuisineId = null)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Username == username);
 
        if (user == null)
            return NotFound("User not found");
 
        var query = _context.Recipes
            .Where(r => r.UserId == user.Id)
            .Include(r => r.RecipeIngredients)
            .Include(r => r.Cuisine)
            .Include(r => r.Diet)
            .Include(r => r.User)
            .AsQueryable();
 
        // Search
        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(r => r.Title.ToLower().Contains(search.ToLower()));
 
        // Filters
        if (dietId.HasValue && dietId > 0)
            query = query.Where(r => r.DietId == dietId);
 
        if (cuisineId.HasValue && cuisineId > 0)
            query = query.Where(r => r.CuisineId == cuisineId);
 
        // Sort (same sortBy values as the main recipes endpoint)
        query = sortBy switch
        {
            1 => query.OrderByDescending(r => r.Id),           // Newest
            2 => query.OrderBy(r => r.Id),                     // Oldest
            3 => query.OrderByDescending(r => r.Likes.Count), // Most liked
            4 => query.OrderBy(r => r.Time),                   // Quickest
            _ => query.OrderByDescending(r => r.Id)
        };
 
        var totalCount = await query.CountAsync();
 
        var recipes = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
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
 
        return Ok(new
        {
            Recipes = recipes,
            TotalCount = totalCount
        });
    }

    [HttpGet("{username}")]
    public async Task<ActionResult<UserSummaryDto>> GetUserByUsername(string username)
    {
        var user = await _context.Users
            .Where(u => u.Username == username)
            .Select(u => new UserSummaryDto
            {
                Id = u.Id,
                Username = u.Username,
                Avatar = u.Avatar
            })
            .FirstOrDefaultAsync();

        if (user == null)
            return NotFound();

        return Ok(user);
    }

    [HttpPost("{id}/avatar")]
    public async Task<IActionResult> UploadAvatar(int id, IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded.");

        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound("User not found.");

        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";

        var uploadPath = Path.Combine(
            Directory.GetCurrentDirectory(),
            "wwwroot",
            "uploads",
            "avatars"
        );

        if (!Directory.Exists(uploadPath))
            Directory.CreateDirectory(uploadPath);

        var filePath = Path.Combine(uploadPath, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
        var extension = Path.GetExtension(file.FileName).ToLower();

        if (!allowedExtensions.Contains(extension))
            return BadRequest("Invalid file type.");

        user.Avatar = $"{fileName}";

        await _context.SaveChangesAsync();

        return Ok(new { avatarUrl = user.Avatar });
    }

    [Authorize]
    [HttpPatch("username")]
    public async Task<IActionResult> UpdateUsername(UpdateUsernameDto dto)
    {
        var user = await _context.Users.FindAsync(GetUserIdFromToken());
        if (user == null) return NotFound();

        var taken = await _context.Users.AnyAsync(u => u.Username == dto.Username && u.Id != user.Id);
        if (taken) return Conflict("Username already taken.");

        user.Username = dto.Username;
        await _context.SaveChangesAsync();
        return Ok();
    }

}