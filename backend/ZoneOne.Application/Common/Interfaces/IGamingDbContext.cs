using Microsoft.EntityFrameworkCore;
using ZoneOne.Domain.Entities;

namespace ZoneOne.Application.Common.Interfaces;

public interface IGamingDbContext
{
    DbSet<GameCategory> GameCategories { get; }
    
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
