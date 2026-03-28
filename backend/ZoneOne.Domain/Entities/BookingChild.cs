namespace ZoneOne.Domain.Entities;

public class BookingChild
{
    public Guid Id { get; init; } = Guid.NewGuid();
    
    public Guid BookingMasterId { get; set; }
    public BookingMaster BookingMaster { get; set; } = null!;
    
    public Guid GameRoomId { get; set; }
    public GameRoom GameRoom { get; set; } = null!;
    
    public Guid GameCategoryId { get; set; }
    public GameCategory GameCategory { get; set; } = null!;

    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public int TotalPersons { get; set; }
    public decimal TableRate { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public bool IsDeleted { get; set; }
}
