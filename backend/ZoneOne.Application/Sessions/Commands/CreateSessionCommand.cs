using MediatR;
using Microsoft.EntityFrameworkCore;
using ZoneOne.Application.Common.Interfaces;
using ZoneOne.Application.Common.Models;
using ZoneOne.Application.Sessions.Queries;
using ZoneOne.Domain.Entities;

namespace ZoneOne.Application.Sessions.Commands;

public record CreateSessionCommand(
    Guid GameRoomId,
    Guid GameCategoryId,
    DateTime StartTime,
    DateTime EndTime,
    int NumberOfPersons) : IRequest<Result<Guid>>;

public class CreateSessionCommandHandler(IGamingDbContext context, IMediator mediator) 
    : IRequestHandler<CreateSessionCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateSessionCommand request, CancellationToken cancellationToken)
    {
        // 1. Validate GameRoom exists and is active
        var room = await context.GameRooms
            .FirstOrDefaultAsync(r => r.Id == request.GameRoomId, cancellationToken);
            
        if (room == null)
            return Result<Guid>.Failure("Game room not found.");

        // 2. Calculate the exact session price using the existing Query pattern
        var amountQuery = new CalculateSessionAmountQuery(
            request.GameRoomId, 
            request.StartTime, 
            request.EndTime, 
            request.NumberOfPersons);
            
        var amountResult = await mediator.Send(amountQuery, cancellationToken);
        
        if (!amountResult.IsSuccess)
            return Result<Guid>.Failure(amountResult.Error ?? "Could not calculate amount.");

        // 3. Save the Session
        var session = new Session
        {
            GameRoomId = request.GameRoomId,
            GameCategoryId = request.GameCategoryId,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            NumberOfPersons = request.NumberOfPersons,
            HourlyRate = room.RatePerHour,
            TotalAmount = amountResult.Value
        };

        context.Sessions.Add(session);
        await context.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(session.Id);
    }
}
