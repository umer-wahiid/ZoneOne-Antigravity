namespace ZoneOne.Domain.Entities;

public class AuditLog
{
    public long Id { get; init; }
    public string Action { get; set; } = string.Empty;      // e.g. "CreateGameCategory", "DeleteGameRoom"
    public string EntityName { get; set; } = string.Empty;   // e.g. "GameCategory", "GameRoom"
    public string? EntityId { get; set; }                     // The affected record's ID
    public string? Details { get; set; }                      // JSON payload of the request
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string? UserName { get; set; }
}
