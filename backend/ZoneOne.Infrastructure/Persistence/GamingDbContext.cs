using Microsoft.EntityFrameworkCore;
using ZoneOne.Application.Common.Interfaces;
using ZoneOne.Domain.Entities;

namespace ZoneOne.Infrastructure.Persistence;

public class GamingDbContext : DbContext, IGamingDbContext
{
    public GamingDbContext(DbContextOptions<GamingDbContext> options) : base(options) { }

    public DbSet<GameCategory> GameCategories => Set<GameCategory>();
    public DbSet<GameRoom> GameRooms => Set<GameRoom>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.Entity<GameCategory>(builder => 
        {
            builder.HasKey(c => c.Id);
            builder.Property(c => c.Name).IsRequired().HasMaxLength(100);
            builder.Property(c => c.Description).HasMaxLength(500);
        });

        modelBuilder.Entity<GameRoom>(builder =>
        {
            builder.HasKey(r => r.Id);
            builder.Property(r => r.RoomNo).IsRequired().HasMaxLength(50);
            builder.Property(r => r.RatePerHour).HasColumnType("decimal(18,2)");
            builder.Property(r => r.RatePerExtraPerson).HasColumnType("decimal(18,2)");
            builder.HasOne(r => r.GameCategory)
                   .WithMany()
                   .HasForeignKey(r => r.GameCategoryId)
                   .OnDelete(DeleteBehavior.Restrict);
            builder.HasQueryFilter(r => !r.IsDeleted);
        });

        modelBuilder.Entity<AuditLog>(builder =>
        {
            builder.HasKey(a => a.Id);
            builder.Property(a => a.Action).IsRequired().HasMaxLength(200);
            builder.Property(a => a.EntityName).IsRequired().HasMaxLength(100);
            builder.Property(a => a.EntityId).HasMaxLength(100);
            builder.Property(a => a.Details).HasColumnType("nvarchar(max)");
            builder.Property(a => a.UserName).HasMaxLength(100);
        });
    }
}
