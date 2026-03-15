using MediatR;
using Microsoft.EntityFrameworkCore;
using ZoneOne.Application.Common.Interfaces;
using ZoneOne.Application.Common.Models;

namespace ZoneOne.Application.Sessions.Queries;

public record CalculateSessionAmountQuery(
    Guid GameRoomId,
    DateTime StartTime,
    DateTime EndTime,
    int NumberOfPersons) : IRequest<Result<decimal>>;

public class CalculateSessionAmountQueryHandler(IGamingDbContext context) 
    : IRequestHandler<CalculateSessionAmountQuery, Result<decimal>>
{
    public async Task<Result<decimal>> Handle(CalculateSessionAmountQuery request, CancellationToken cancellationToken)
    {
        var room = await context.GameRooms
            .FirstOrDefaultAsync(r => r.Id == request.GameRoomId, cancellationToken);

        if (room == null)
            return Result<decimal>.Failure("Game room not found.");

        if (request.EndTime <= request.StartTime)
            return Result<decimal>.Failure("End time must be after start time.");

        var duration = request.EndTime - request.StartTime;
        var totalHours = (decimal)duration.TotalHours;

        // Base rate based on room
        var amount = room.RatePerHour * totalHours;

        // Add extra person charges if applicable
        if (request.NumberOfPersons > room.MaxPlayers)
        {
            var extraPersons = request.NumberOfPersons - room.MaxPlayers;
            amount += (room.RatePerExtraPerson * extraPersons * totalHours);
        }

        // Round to 2 decimal places for currency
        amount = Math.Round(amount, 2);

        return Result<decimal>.Success(amount);
    }
}
