using ZoneOne.Application.Common.Models;

namespace ZoneOne.Application.Common.Interfaces;

public interface IIdentityService
{
    Task<Result<AuthResponseDto>> LoginAsync(string userName, string password);
    Task<Result<bool>> CreateUserAsync(string userName, string password, string fullName, string role);
}
