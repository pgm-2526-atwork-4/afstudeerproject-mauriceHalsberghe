using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecipeBackend.Data;
using RecipeBackend.Models;

namespace RecipeBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InventoryIngredientController : ControllerBase
{
    private readonly ApiDbContext _context;

    public InventoryIngredientController(ApiDbContext context)
    {
        _context = context;
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<InventoryIngredient>>> GetUserInventory(int userId)
    {
        var userInventory = await _context.InventoryIngredients
            .Where(i => i.UserId == userId)
            .Include(i => i.Ingredient)
            .Include(i => i.QuantityUnit)
            .ToListAsync();

        if (!userInventory.Any())
        {
            return NotFound($"No inventory found for user {userId}");
        }

        return Ok(userInventory);
    }

    [HttpPost]
    public async Task<ActionResult<InventoryIngredient>> AddInventoryIngredient(CreateInventoryIngredientDto dto)
    {
        var ingredientExists = await _context.Ingredients
            .AnyAsync(i => i.Id == dto.IngredientId);

        if (!ingredientExists)
            return BadRequest("Ingredient does not exist.");

        var inventoryIngredient = new InventoryIngredient
        {
            UserId = dto.UserId,
            Quantity = dto.Quantity,
            QuantityUnitId = dto.QuantityUnitId,
            IngredientId = dto.IngredientId
        };

        _context.InventoryIngredients.Add(inventoryIngredient);
        await _context.SaveChangesAsync();

        return Ok(inventoryIngredient);
    }
}