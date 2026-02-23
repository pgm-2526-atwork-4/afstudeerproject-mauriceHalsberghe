using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using RecipeBackend.Data;
using RecipeBackend.Models;
using System.Security.Claims;

namespace RecipeBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DietsController : ControllerBase
{
    private readonly ApiDbContext _context;

    public DietsController(ApiDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Diet>>> GetDiets()
    {
        return await _context.Diets.ToListAsync();
    }
}