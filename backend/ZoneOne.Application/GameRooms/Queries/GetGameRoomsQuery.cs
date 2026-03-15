using MediatR;
using Microsoft.EntityFrameworkCore;
using ZoneOne.Application.Common.Interfaces;

namespace ZoneOne.Application.GameRooms.Queries;

public record GetGameRoomsQuery : IRequest<IEnumerable<GameRoomDto>>;

public class GetGameRoomsQueryHandler : IRequestHandler<GetGameRoomsQuery, IEnumerable<GameRoomDto>>
{
    private readonly IGamingDbContext _context;

    public GetGameRoomsQueryHandler(IGamingDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<GameRoomDto>> Handle(GetGameRoomsQuery request, CancellationToken cancellationToken)
    {
        return await _context.GameRooms
            .Include(r => r.GameCategory)
            .Select(r => new GameRoomDto(
                r.Id, r.RoomNo, r.GameCategoryId, r.GameCategory.Name,
                r.MaxPlayers, r.RatePerHour, r.RatePerExtraPerson))
            .ToListAsync(cancellationToken);
    }
}
