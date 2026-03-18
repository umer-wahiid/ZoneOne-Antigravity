using Microsoft.EntityFrameworkCore;
using ZoneOne.Domain.Entities;

namespace ZoneOne.Application.Common.Interfaces;

public interface IGamingDbContext
{
    DbSet<GameCategory> GameCategories { get; }
    DbSet<GameRoom> GameRooms { get; }
    DbSet<BookingMaster> BookingMasters { get; }
    DbSet<BookingChild> BookingChildren { get; }
    DbSet<BookingExtra> BookingExtras { get; }
    DbSet<Extra> Extras { get; }
    DbSet<AuditLog> AuditLogs { get; }
    
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
