namespace ZoneOne.Domain.Entities;

public class GameRoom
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public string RoomNo { get; set; } = string.Empty;
    public Guid GameCategoryId { get; set; }
    public GameCategory GameCategory { get; set; } = null!;
    public int MaxPlayers { get; set; }
    public decimal RatePerHour { get; set; }
    public decimal RatePerExtraPerson { get; set; }
    public bool IsDeleted { get; set; } = false;
}
