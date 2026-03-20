using Microsoft.AspNetCore.Identity;
using ZoneOne.Domain.Enums;

namespace ZoneOne.Infrastructure.Identity;

public class ApplicationUser : IdentityUser
{
    public string? FullName { get; set; }
    public UserRole Role { get; set; }
}
