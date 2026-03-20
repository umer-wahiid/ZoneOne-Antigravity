using Microsoft.AspNetCore.Identity;
using ZoneOne.Application.Common.Interfaces;
using ZoneOne.Application.Common.Models;
using ZoneOne.Domain.Enums;

namespace ZoneOne.Infrastructure.Identity;

public class IdentityService(
    UserManager<ApplicationUser> userManager,
    ITokenService tokenService) : IIdentityService
{
    public async Task<Result<AuthResponseDto>> LoginAsync(string userName, string password)
    {
        var user = await userManager.FindByNameAsync(userName);
        if (user == null)
        {
            return Result<AuthResponseDto>.Failure("Invalid username or password.");
        }

        var result = await userManager.CheckPasswordAsync(user, password);
        if (!result)
        {
            return Result<AuthResponseDto>.Failure("Invalid username or password.");
        }

        var token = tokenService.GenerateJwtToken(
            user.Id, 
            user.UserName!, 
            user.FullName ?? string.Empty, 
            user.Role.ToString());

        var authResponse = new AuthResponseDto(
            user.Id,
            user.UserName!,
            user.FullName ?? string.Empty,
            user.Role,
            token);

        return Result<AuthResponseDto>.Success(authResponse);
    }

    public async Task<Result<bool>> CreateUserAsync(string userName, string password, string fullName, string role)
    {
        var user = new ApplicationUser
        {
            UserName = userName,
            Email = userName, // For simplicity
            FullName = fullName,
            Role = Enum.Parse<UserRole>(role)
        };

        var result = await userManager.CreateAsync(user, password);
        if (!result.Succeeded)
        {
            return Result<bool>.Failure(string.Join(", ", result.Errors.Select(e => e.Description)));
        }

        return Result<bool>.Success(true);
    }
}
