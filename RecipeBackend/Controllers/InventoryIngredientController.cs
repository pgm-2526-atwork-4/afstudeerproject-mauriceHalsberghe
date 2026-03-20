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

    [HttpPost("move")]
    public async Task<IActionResult> AddMoveInventoryIngredients(List<CreateInventoryIngredientDto> dtos)
    {
        var ingredientIds = dtos.Select(d => d.IngredientId).ToList();

        var validIds = await _context.Ingredients
            .Where(i => ingredientIds.Contains(i.Id))
            .Select(i => i.Id)
            .ToListAsync();

        var invalidIds = ingredientIds.Except(validIds).ToList();
        if (invalidIds.Any())
            return BadRequest("error");

        foreach (var dto in dtos)
        {
            var existing = await _context.InventoryIngredients
                .FirstOrDefaultAsync(ii => ii.UserId == dto.UserId && ii.IngredientId == dto.IngredientId);

            if (existing != null)
            {
                existing.Quantity = (existing.Quantity ?? 0) + (dto.Quantity ?? 0);
            }
            else
            {
                _context.InventoryIngredients.Add(new InventoryIngredient
                {
                    UserId = dto.UserId,
                    IngredientId = dto.IngredientId,
                    Quantity = dto.Quantity,
                    QuantityUnitId = dto.QuantityUnitId
                });
            }
        }

        await _context.SaveChangesAsync();
        return Ok();
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateIngredient(int id, UpdateInventoryIngredientDto dto)
    {
        var item = await _context.InventoryIngredients
            .Include(i => i.Ingredient)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (item == null)
            return NotFound("Inventory ingredient not found.");

        if (!string.IsNullOrWhiteSpace(dto.IngredientName) &&
            !string.Equals(item.Ingredient.Name, dto.IngredientName, StringComparison.OrdinalIgnoreCase))
        {
            item.Ingredient.Name = dto.IngredientName;
        }

        item.Quantity = dto.Quantity;
        item.QuantityUnitId = dto.QuantityUnitId;

        await _context.SaveChangesAsync();

        return Ok(item);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteInventoryIngredient(int id)
    {
        var item = await _context.InventoryIngredients.FindAsync(id);

        if (item == null)
            return NotFound("Inventory ingredient not found.");

        _context.InventoryIngredients.Remove(item);
        await _context.SaveChangesAsync();

        return Ok();
    }

    [HttpPost("remove/{recipeId}/user/{userId}")]
    public async Task<IActionResult> UseRecipeIngredients(int recipeId, int userId)
    {
        var recipeIngredients = await _context.RecipeIngredients
            .Include(ri => ri.Ingredient)
            .Where(ri => ri.RecipeId == recipeId && ri.Ingredient != null && !ri.Ingredient.AlwaysInStock)
            .ToListAsync();

        if (!recipeIngredients.Any())
            return Ok();

        foreach (var recipeIngredient in recipeIngredients)
        {
            var inventoryItem = await _context.InventoryIngredients
                .FirstOrDefaultAsync(ii => ii.UserId == userId && ii.IngredientId == recipeIngredient.IngredientId);

            if (inventoryItem == null) continue;

            if (inventoryItem.Quantity.HasValue && recipeIngredient.Quantity.HasValue)
            {
                inventoryItem.Quantity -= recipeIngredient.Quantity.Value;

                if (inventoryItem.Quantity <= 0)
                    _context.InventoryIngredients.Remove(inventoryItem);
            }
            else
            {
                _context.InventoryIngredients.Remove(inventoryItem);
            }
        }

        await _context.SaveChangesAsync();
        return Ok();
    }
}