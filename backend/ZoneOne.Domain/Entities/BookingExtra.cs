namespace ZoneOne.Domain.Entities;

public class BookingExtra
{
    public Guid Id { get; init; } = Guid.NewGuid();
    
    public Guid BookingMasterId { get; set; }
    public BookingMaster BookingMaster { get; set; } = null!;
    
    public Guid ExtraId { get; set; }
    public Extra Extra { get; set; } = null!;
    
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalAmount { get; set; }
    public bool IsDeleted { get; set; }
}
