using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecipeBackend.Data;
using RecipeBackend.Models;

namespace RecipeBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AllergyController : ControllerBase
{
    private readonly ApiDbContext _context;

    public AllergyController(ApiDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Allergy>>> GetAllergies()
    {
        return await _context.Allergies.ToListAsync();
    }

    [HttpGet("user/{id}")]
    public async Task<ActionResult<IEnumerable<Allergy>>> GetRecipesByUserId(int id)
    {

        var allergies = await _context.Allergies
            .Where(r => r.UserId == id)
            .ToListAsync();

        return Ok(allergies);
    }
}