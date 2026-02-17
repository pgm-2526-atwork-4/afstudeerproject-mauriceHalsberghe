namespace RecipeBackend.DTOs;

public record RegisterDto(
    string Username,
    string Email,
    string Password,
    string? Bio,
    string? Avatar
);

public record LoginDto(
    string Email,
    string Password
);

public record AuthResponseDto(
    string Token,
    string Username,
    string Email,
    string? Avatar,
    string? Bio
);