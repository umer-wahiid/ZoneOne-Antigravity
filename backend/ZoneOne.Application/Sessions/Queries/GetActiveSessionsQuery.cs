using MediatR;
using Microsoft.EntityFrameworkCore;
using ZoneOne.Application.Common.Interfaces;

namespace ZoneOne.Application.Sessions.Queries;

public record GetActiveSessionsQuery() : IRequest<IEnumerable<SessionDto>>;

public class GetActiveSessionsQueryHandler(IGamingDbContext context) 
    : IRequestHandler<GetActiveSessionsQuery, IEnumerable<SessionDto>>
{
    public async Task<IEnumerable<SessionDto>> Handle(GetActiveSessionsQuery request, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        
        // Active sessions: EndTime is either null (open-ended) or hasn't passed yet.
        return await context.Sessions
            .Include(s => s.GameRoom)
            .Include(s => s.GameCategory)
            .Where(s => s.EndTime == null || s.EndTime >= now)
            .OrderByDescending(s => s.StartTime)
            .Select(s => new SessionDto(
                s.Id,
                s.GameRoomId,
                s.GameRoom.RoomNo,
                s.GameCategoryId,
                s.GameCategory.Name,
                s.StartTime,
                s.EndTime,
                s.NumberOfPersons,
                s.HourlyRate,
                s.TotalAmount
            ))
            .ToListAsync(cancellationToken);
    }
}
