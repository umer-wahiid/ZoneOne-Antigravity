namespace ZoneOne.Application.Sessions.Queries;

public record SessionDto(
    Guid Id,
    Guid GameRoomId,
    string RoomNo,
    Guid GameCategoryId,
    string CategoryName,
    DateTime StartTime,
    DateTime? EndTime,
    int NumberOfPersons,
    decimal HourlyRate,
    decimal TotalAmount
);
