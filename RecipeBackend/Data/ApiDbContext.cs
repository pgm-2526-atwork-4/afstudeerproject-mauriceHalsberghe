using Microsoft.EntityFrameworkCore;
using RecipeBackend.Models;

namespace RecipeBackend.Data;

public class ApiDbContext : DbContext
{
    public ApiDbContext(DbContextOptions<ApiDbContext> options) : base(options) { }

    public DbSet<Recipe> Recipes { get; set; }
}