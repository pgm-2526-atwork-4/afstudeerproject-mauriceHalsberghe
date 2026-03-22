using System.Data.Common;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace RecipeBackend.Data;

public class RlsInterceptor : IDbConnectionInterceptor
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public RlsInterceptor(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task ConnectionOpenedAsync(
        DbConnection connection,
        ConnectionEndEventData eventData,
        CancellationToken cancellationToken = default)
    {
        var user = _httpContextAccessor.HttpContext?.User;
        var userId = user?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                  ?? user?.FindFirst("sub")?.Value;

        if (!string.IsNullOrEmpty(userId))
        {
            await using var cmd = connection.CreateCommand();
            cmd.CommandText = $"SET app.current_user_id = '{userId}'";
            await cmd.ExecuteNonQueryAsync(cancellationToken);
        }
    }
}