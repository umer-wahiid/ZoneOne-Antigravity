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
            Email = userName, 
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

    public async Task<Result<bool>> UpdateUserAsync(string userId, string userName, string fullName, string role, string? password)
    {
        var user = await userManager.FindByIdAsync(userId);
        if (user == null) return Result<bool>.Failure("User not found.");

        user.UserName = userName;
        user.Email = userName; // Keep consistent
        user.FullName = fullName;
        user.Role = Enum.Parse<UserRole>(role);

        var result = await userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            return Result<bool>.Failure(string.Join(", ", result.Errors.Select(e => e.Description)));
        }

        if (!string.IsNullOrWhiteSpace(password))
        {
             var token = await userManager.GeneratePasswordResetTokenAsync(user);
             var resetResult = await userManager.ResetPasswordAsync(user, token, password);
             if (!resetResult.Succeeded)
             {
                 return Result<bool>.Failure("Updated profile, but password reset failed: " + string.Join(", ", resetResult.Errors.Select(e => e.Description)));
             }
        }

        return Result<bool>.Success(true);
    }

    public async Task<Result<bool>> DeleteUserAsync(string userId)
    {
        var user = await userManager.FindByIdAsync(userId);
        if (user == null) return Result<bool>.Failure("User not found.");

        if (user.UserName?.ToLower() == "admin")
        {
            return Result<bool>.Failure("Primary admin user cannot be deleted.");
        }

        var result = await userManager.DeleteAsync(user);
        if (!result.Succeeded)
        {
            return Result<bool>.Failure(string.Join(", ", result.Errors.Select(e => e.Description)));
        }

        return Result<bool>.Success(true);
    }

    public async Task<List<UserDto>> GetUsersAsync()
    {
        var users = await Task.FromResult(userManager.Users.OrderBy(u => u.FullName).ToList());
        return users.Select(u => new UserDto(u.Id, u.UserName!, u.FullName ?? string.Empty, u.Role.ToString())).ToList();
    }
}
