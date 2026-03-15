namespace ZoneOne.Domain.Entities;

public class BookingMaster
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public decimal TotalPayment { get; set; }
    public string PaymentStatus { get; set; } = string.Empty;
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;

    public ICollection<BookingChild> BookingChildren { get; set; } = new List<BookingChild>();
}
