using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ZoneOne.Application.Common.Interfaces;
using ZoneOne.Infrastructure.Persistence;

namespace ZoneOne.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        services.AddDbContext<GamingDbContext>(options =>
            options.UseSqlServer(connectionString,
                builder => builder.MigrationsAssembly(typeof(GamingDbContext).Assembly.FullName)));

        services.AddScoped<IGamingDbContext>(provider => provider.GetRequiredService<GamingDbContext>());

        return services;
    }
}
