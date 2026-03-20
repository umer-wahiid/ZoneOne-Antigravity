using ZoneOne.Application.Common.Models;

namespace ZoneOne.Application.Common.Interfaces;

public interface IIdentityService
{
    Task<Result<AuthResponseDto>> LoginAsync(string userName, string password);
    Task<Result<bool>> CreateUserAsync(string userName, string password, string fullName, string role);
    Task<Result<bool>> UpdateUserAsync(string userId, string userName, string fullName, string role, string? password);
    Task<Result<bool>> DeleteUserAsync(string userId);
    Task<List<UserDto>> GetUsersAsync();
}

public record UserDto(string Id, string UserName, string FullName, string Role);
