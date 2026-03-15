namespace ZoneOne.Application.GameRooms.Queries;

public record GameRoomDto(
    Guid Id,
    string RoomNo,
    Guid GameCategoryId,
    string GameCategoryName,
    int MaxPlayers,
    decimal RatePerHour,
    decimal RatePerExtraPerson);
