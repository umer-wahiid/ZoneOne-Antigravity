using Microsoft.EntityFrameworkCore;
using ZoneOne.Domain.Entities;

namespace ZoneOne.Application.Common.Interfaces;

public interface IGamingDbContext
{
    DbSet<GameCategory> GameCategories { get; }
    DbSet<GameRoom> GameRooms { get; }
    DbSet<AuditLog> AuditLogs { get; }
    
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
