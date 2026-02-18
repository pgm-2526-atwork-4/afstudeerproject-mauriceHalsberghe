using Microsoft.EntityFrameworkCore;
using RecipeBackend.Models;

namespace RecipeBackend.Data;

public class ApiDbContext : DbContext
{
    public ApiDbContext(DbContextOptions<ApiDbContext> options) : base(options) { }

    public DbSet<Recipe> Recipes { get; set; }
    public DbSet<Step> Steps { get; set; }
    public DbSet<Ingredient> Ingredients { get; set; }
    public DbSet<IngredientType> IngredientTypes { get; set; }
    public DbSet<RecipeIngredient> RecipeIngredients { get; set; }
    public DbSet<QuantityUnit> QuantityUnits { get; set; }
    public DbSet<Diet> Diets { get; set; }
    public DbSet<Cuisine> Cuisines { get; set; }
    public DbSet<DishType> DishTypes { get; set; }
    public DbSet<RecipeDishType> RecipeDishTypes { get; set; }
    public DbSet<Allergy> Allergies { get; set; }

    public DbSet<User> Users { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email).IsUnique();
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username).IsUnique();
        modelBuilder.Entity<Recipe>()
            .HasOne(r => r.User)
            .WithMany() 
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Cascade)
            .IsRequired(false);

    }
}