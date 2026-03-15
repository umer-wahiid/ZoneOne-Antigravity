namespace ZoneOne.Domain.Entities;

public class Session
{
    public Guid Id { get; init; } = Guid.NewGuid();
    
    public Guid GameRoomId { get; set; }
    public GameRoom GameRoom { get; set; } = null!;
    
    public Guid GameCategoryId { get; set; }
    public GameCategory GameCategory { get; set; } = null!;

    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public int NumberOfPersons { get; set; }
    public decimal HourlyRate { get; set; }
    public decimal TotalAmount { get; set; }
}
