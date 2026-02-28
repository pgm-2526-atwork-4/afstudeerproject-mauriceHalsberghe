using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using RecipeBackend.Data;
using RecipeBackend.Models;
using System.Security.Claims;

namespace RecipeBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class QuantityUnitsController : ControllerBase
{
    private readonly ApiDbContext _context;

    public QuantityUnitsController(ApiDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<QuantityUnit>>> GetQuantityUnits()
    {
        return await _context.QuantityUnits.ToListAsync();
    }
}