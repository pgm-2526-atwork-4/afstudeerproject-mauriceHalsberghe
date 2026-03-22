using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using RecipeBackend.Data;

namespace RecipeBackend.Middleware;

public class RlsMiddleware
{
    private readonly RequestDelegate _next;

    public RlsMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, ApiDbContext db)
    {
        var userIdClaim = context.User?.FindFirst(ClaimTypes.NameIdentifier)
                       ?? context.User?.FindFirst("sub");

        if (userIdClaim != null)
        {
            await db.Database.ExecuteSqlRawAsync(
                "SELECT set_config('app.current_user_id', {0}, true)",
                userIdClaim.Value
            );
        }

        await _next(context);
    }
}