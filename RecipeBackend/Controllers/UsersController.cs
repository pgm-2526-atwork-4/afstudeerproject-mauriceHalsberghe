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

    [Authorize]
    [HttpPost("preferences")]
    public async Task<IActionResult> UpdatePreferences(UpdateUserPreferencesDto dto)
    {
        var user = await _context.Users.FindAsync(GetUserIdFromToken());
        if (user == null) return NotFound();

        user.DietId = dto.DietId;

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
    public async Task<ActionResult<IEnumerable<RecipeDto>>> GetRecipesByUsername(
        string username,
        int? currentUserId)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Username == username);

        if (user == null)
            return NotFound("User not found");

        var recipes = await _context.Recipes
            .Where(r => r.UserId == user.Id)
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

}