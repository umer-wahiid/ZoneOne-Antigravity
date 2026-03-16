using MediatR;
using Microsoft.EntityFrameworkCore;
using ZoneOne.Application.Common.Interfaces;
using ZoneOne.Application.Common.Models;

namespace ZoneOne.Application.Bookings.Commands;

public record DeleteBookingCommand(Guid Id) : IRequest<Result<bool>>;

public class DeleteBookingCommandHandler(IGamingDbContext context) : IRequestHandler<DeleteBookingCommand, Result<bool>>
{
    public async Task<Result<bool>> Handle(DeleteBookingCommand request, CancellationToken cancellationToken)
    {
        var booking = await context.BookingMasters
            .Include(b => b.BookingChildren)
            .FirstOrDefaultAsync(b => b.Id == request.Id, cancellationToken);
            
        if (booking == null)
            return Result<bool>.Failure("Booking not found");

        booking.IsDeleted = true;
        foreach (var child in booking.BookingChildren)
        {
            child.IsDeleted = true;
        }

        await context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
