using Microsoft.EntityFrameworkCore;
using ZoneOne.Application.Common.Interfaces;
using ZoneOne.Domain.Entities;

namespace ZoneOne.Infrastructure.Persistence;

public class GamingDbContext : DbContext, IGamingDbContext
{
    public GamingDbContext(DbContextOptions<GamingDbContext> options) : base(options) { }

    public DbSet<GameCategory> GameCategories => Set<GameCategory>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.Entity<GameCategory>(builder => 
        {
            builder.HasKey(c => c.Id);
            builder.Property(c => c.Name).IsRequired().HasMaxLength(100);
            builder.Property(c => c.Description).HasMaxLength(500);
        });
    }
}
