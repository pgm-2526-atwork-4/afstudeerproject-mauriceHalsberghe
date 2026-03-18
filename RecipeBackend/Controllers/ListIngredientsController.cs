using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using RecipeBackend.Data;
using RecipeBackend.Models;
using System.Security.Claims;

namespace RecipeBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ListIngredientsController : ControllerBase
{
    private readonly ApiDbContext _context;

    public ListIngredientsController(ApiDbContext context)
    {
        _context = context;
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<ListIngredient>>> GetUserList(int userId)
    {
        var userList = await _context.ListIngredients
            .Where(i => i.UserId == userId)
            .Include(i => i.Ingredient)
            .Include(i => i.QuantityUnit)
            .ToListAsync();

        return Ok(userList);
    }

    [HttpPut("toggle")]
    public async Task<IActionResult> Toggle(int userId, int listIngredientId)
    {
        var item = await _context.ListIngredients
            .FirstOrDefaultAsync(i => i.Id == listIngredientId && i.UserId == userId);

        if (item == null)
        {
            return NotFound("List ingredient not found.");
        }

        item.Checked = !item.Checked;

        await _context.SaveChangesAsync();

        return Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<ListIngredient>> AddListIngredient(CreateListIngredientDto dto)
    {
        var ingredientExists = await _context.Ingredients
            .AnyAsync(i => i.Id == dto.IngredientId);

        if (!ingredientExists)
            return BadRequest("Ingredient does not exist.");

        var listIngredient = new ListIngredient
        {
            UserId = dto.UserId,
            Quantity = dto.Quantity,
            QuantityUnitId = dto.QuantityUnitId,
            IngredientId = dto.IngredientId,
            Checked = false
        };

        _context.ListIngredients.Add(listIngredient);
        await _context.SaveChangesAsync();

        return Ok(listIngredient);
    }

    [HttpDelete("move")]
    public async Task<IActionResult> DeleteMoveListIngredients([FromBody] DeleteListIngredientsDto dto)
    {
        var items = await _context.ListIngredients
            .Where(i => dto.Ids.Contains(i.Id) && i.UserId == dto.UserId)
            .ToListAsync();

        if (!items.Any())
            return NotFound("No matching list ingredients found.");

        _context.ListIngredients.RemoveRange(items);
        await _context.SaveChangesAsync();

        return Ok();
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateIngredient(int id, UpdateListIngredientDto dto)
    {
        var item = await _context.ListIngredients
            .Include(i => i.Ingredient)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (item == null)
            return NotFound("List ingredient not found.");

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
    public async Task<IActionResult> DeleteListIngredient(int id)
    {
        var item = await _context.ListIngredients.FindAsync(id);

        if (item == null)
            return NotFound("Inventory ingredient not found.");

        _context.ListIngredients.Remove(item);
        await _context.SaveChangesAsync();

        return Ok();
    }
    
}