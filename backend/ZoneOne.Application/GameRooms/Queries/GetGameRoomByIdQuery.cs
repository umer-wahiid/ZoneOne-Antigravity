using MediatR;
using Microsoft.EntityFrameworkCore;
using ZoneOne.Application.Common.Interfaces;

namespace ZoneOne.Application.GameRooms.Queries;

public record GetGameRoomByIdQuery(Guid Id) : IRequest<GameRoomDto?>;

public class GetGameRoomByIdQueryHandler : IRequestHandler<GetGameRoomByIdQuery, GameRoomDto?>
{
    private readonly IGamingDbContext _context;

    public GetGameRoomByIdQueryHandler(IGamingDbContext context)
    {
        _context = context;
    }

    public async Task<GameRoomDto?> Handle(GetGameRoomByIdQuery request, CancellationToken cancellationToken)
    {
        return await _context.GameRooms
            .Include(r => r.GameCategory)
            .Where(r => r.Id == request.Id)
            .Select(r => new GameRoomDto(
                r.Id, r.RoomNo, r.GameCategoryId, r.GameCategory.Name,
                r.MaxPlayers, r.RatePerHour, r.RatePerExtraPerson))
            .FirstOrDefaultAsync(cancellationToken);
    }
}
