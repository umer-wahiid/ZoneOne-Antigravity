using MediatR;
using Microsoft.EntityFrameworkCore;
using ZoneOne.Application.Common.Interfaces;
using ZoneOne.Application.Common.Models;

namespace ZoneOne.Application.Bookings.Queries;

public record CheckOverlapQuery(
    Guid GameRoomId,
    DateTime StartTime,
    DateTime EndTime,
    Guid? ExcludeBookingMasterId = null) : IRequest<Result<bool>>;

public class CheckOverlapQueryHandler(IGamingDbContext context) : IRequestHandler<CheckOverlapQuery, Result<bool>>
{
    public async Task<Result<bool>> Handle(CheckOverlapQuery request, CancellationToken cancellationToken)
    {
        var query = context.BookingChildren
            .Where(c => c.GameRoomId == request.GameRoomId
                     && c.StartTime < request.EndTime
                     && c.EndTime > request.StartTime);

        if (request.ExcludeBookingMasterId.HasValue)
        {
            query = query.Where(c => c.BookingMasterId != request.ExcludeBookingMasterId.Value);
        }

        bool isOverlapping = await query.AnyAsync(cancellationToken);

        if (isOverlapping)
            return Result<bool>.Failure("Room is already booked for the selected time slot.");

        return Result<bool>.Success(true);
    }
}
