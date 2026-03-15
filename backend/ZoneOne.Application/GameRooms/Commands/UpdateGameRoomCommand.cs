using MediatR;
using Microsoft.EntityFrameworkCore;
using ZoneOne.Application.Common.Interfaces;

namespace ZoneOne.Application.GameRooms.Commands;

public record UpdateGameRoomCommand(
    Guid Id,
    string RoomNo,
    Guid GameCategoryId,
    int MaxPlayers,
    decimal RatePerHour,
    decimal RatePerExtraPerson) : IRequest<bool>;

public class UpdateGameRoomCommandHandler : IRequestHandler<UpdateGameRoomCommand, bool>
{
    private readonly IGamingDbContext _context;

    public UpdateGameRoomCommandHandler(IGamingDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateGameRoomCommand request, CancellationToken cancellationToken)
    {
        var room = await _context.GameRooms
            .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken);

        if (room == null) return false;

        room.RoomNo = request.RoomNo;
        room.GameCategoryId = request.GameCategoryId;
        room.MaxPlayers = request.MaxPlayers;
        room.RatePerHour = request.RatePerHour;
        room.RatePerExtraPerson = request.RatePerExtraPerson;

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
