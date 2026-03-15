using System.Text.Json;
using MediatR;
using ZoneOne.Application.Common.Interfaces;
using ZoneOne.Domain.Entities;

namespace ZoneOne.Application.Common.Behaviors;

public class AuditLoggingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly IGamingDbContext _context;

    public AuditLoggingBehavior(IGamingDbContext context)
    {
        _context = context;
    }

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        // Only log commands (skip queries)
        var requestName = typeof(TRequest).Name;
        if (!requestName.EndsWith("Command"))
        {
            return await next(cancellationToken);
        }

        // Execute the command first
        var response = await next(cancellationToken);

        // Determine entity name and action from request type name
        // e.g. "CreateGameCategoryCommand" -> Action: "Create", Entity: "GameCategory"
        var action = "Unknown";
        var entityName = "Unknown";

        if (requestName.Contains("Create")) action = "Create";
        else if (requestName.Contains("Update")) action = "Update";
        else if (requestName.Contains("Delete")) action = "Delete";

        entityName = requestName
            .Replace("Create", "")
            .Replace("Update", "")
            .Replace("Delete", "")
            .Replace("Command", "");

        // Try to extract the entity ID from the response or request
        string? entityId = null;
        if (response is Guid guidResult)
        {
            entityId = guidResult.ToString();
        }
        else
        {
            // Try to get Id property from request (for Update/Delete commands)
            var idProp = typeof(TRequest).GetProperty("Id");
            if (idProp != null)
            {
                var idValue = idProp.GetValue(request);
                entityId = idValue?.ToString();
            }
        }

        var auditLog = new AuditLog
        {
            Action = action,
            EntityName = entityName,
            EntityId = entityId,
            Details = JsonSerializer.Serialize(request),
            Timestamp = DateTime.UtcNow,
            UserName = "System" // Replace with actual user when auth is implemented
        };

        _context.AuditLogs.Add(auditLog);
        await _context.SaveChangesAsync(cancellationToken);

        return response;
    }
}
