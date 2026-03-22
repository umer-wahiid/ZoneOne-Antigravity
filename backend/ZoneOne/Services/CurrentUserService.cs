using System.Security.Claims;
using ZoneOne.Application.Common.Interfaces;

namespace ZoneOne.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public string? UserId => _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
    
    // In many basic JWT setups the "Name" or a specific claim holds the username.
    public string? UserName => _httpContextAccessor.HttpContext?.User?.Identity?.Name ?? _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Name);
}
