using Microsoft.AspNetCore.Mvc;
using RecipeBackend.Data;
using RecipeBackend.DTOs;
using RecipeBackend.Models;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

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
        var userId = GetUserIdFromToken();

        var user = await _context.Users.FindAsync(userId);

        if (user == null)
            return NotFound();

        user.DietId = dto.DietId;

        var existingAllergies = _context.Allergies
            .Where(a => a.UserId == userId);

        _context.Allergies.RemoveRange(existingAllergies);

        foreach (var ingredientId in dto.IngredientAllergyIds)
        {
            _context.Allergies.Add(new Allergy
            {
                UserId = userId,
                IngredientId = ingredientId
            });
        }

        foreach (var typeId in dto.IngredientTypeAllergyIds)
        {
            _context.Allergies.Add(new Allergy
            {
                UserId = userId,
                IngredientTypeId = typeId
            });
        }

        await _context.SaveChangesAsync();

        return Ok();
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
}