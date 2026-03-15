using System.Reflection;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using ZoneOne.Application.Common.Behaviors;

namespace ZoneOne.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddMediatR(cfg => {
            cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly());
            cfg.AddOpenBehavior(typeof(AuditLoggingBehavior<,>));
        });

        return services;
    }
}
