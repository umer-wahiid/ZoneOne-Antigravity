using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ZoneOne.Domain.Enums;
using ZoneOne.Infrastructure.Identity;

namespace ZoneOne.Infrastructure.Persistence;

public class GamingDbContextInitialiser(
    GamingDbContext context,
    UserManager<ApplicationUser> userManager,
    RoleManager<IdentityRole> roleManager)
{
    public async Task InitialiseAsync()
    {
        try
        {
            if (context.Database.IsSqlServer())
            {
                await context.Database.MigrateAsync();
            }
        }
        catch (Exception)
        {
            // Log error
            throw;
        }
    }

    public async Task SeedAsync()
    {
        try
        {
            await TrySeedAsync();
        }
        catch (Exception)
        {
            // Log error
            throw;
        }
    }

    private async Task TrySeedAsync()
    {
        // Default roles
        var adminRole = new IdentityRole(UserRole.Admin.ToString());

        if (roleManager.Roles.All(r => r.Name != adminRole.Name))
        {
            await roleManager.CreateAsync(adminRole);
        }

        // Default users
        var administrator = new ApplicationUser 
        { 
            UserName = "admin", 
            Email = "admin@localhost",
            FullName = "Administrator",
            Role = UserRole.Admin
        };

        if (userManager.Users.All(u => u.UserName != administrator.UserName))
        {
            await userManager.CreateAsync(administrator, "Admin123!");
            await userManager.AddToRoleAsync(administrator, adminRole.Name!);
        }
    }
}
