using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecipeBackend.Data;
using RecipeBackend.Models;

namespace RecipeBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class IngredientTypesController : ControllerBase
{
    private readonly ApiDbContext _context;

    public IngredientTypesController(ApiDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<IngredientType>>> GetIngredientTypes()
    {
        return await _context.IngredientTypes.ToListAsync();
    }
}