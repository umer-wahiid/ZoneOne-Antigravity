using MediatR;
using ZoneOne.Application.Common.Interfaces;
using ZoneOne.Domain.Entities;

namespace ZoneOne.Application.GameRooms.Commands;

public record CreateGameRoomCommand(
    string RoomNo,
    Guid GameCategoryId,
    int MaxPlayers,
    decimal RatePerHour,
    decimal RatePerExtraPerson) : IRequest<Guid>;

public class CreateGameRoomCommandHandler : IRequestHandler<CreateGameRoomCommand, Guid>
{
    private readonly IGamingDbContext _context;

    public CreateGameRoomCommandHandler(IGamingDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateGameRoomCommand request, CancellationToken cancellationToken)
    {
        var room = new GameRoom
        {
            RoomNo = request.RoomNo,
            GameCategoryId = request.GameCategoryId,
            MaxPlayers = request.MaxPlayers,
            RatePerHour = request.RatePerHour,
            RatePerExtraPerson = request.RatePerExtraPerson
        };

        _context.GameRooms.Add(room);
        await _context.SaveChangesAsync(cancellationToken);

        return room.Id;
    }
}
