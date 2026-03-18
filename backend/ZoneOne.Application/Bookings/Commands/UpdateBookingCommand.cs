using MediatR;
using Microsoft.EntityFrameworkCore;
using ZoneOne.Application.Common.Interfaces;
using ZoneOne.Application.Common.Models;
using ZoneOne.Domain.Entities;
using ZoneOne.Application.Sessions.Queries;

namespace ZoneOne.Application.Bookings.Commands;

public record UpdateBookingCommand(
    Guid Id,
    string CustomerName,
    string CustomerPhone,
    string PaymentStatus,
    decimal PaidAmount,
    List<BookingItemCommand> Items,
    List<BookingExtraCommand>? Extras = null) : IRequest<Result<bool>>;

public class UpdateBookingCommandHandler(IGamingDbContext context, IMediator mediator) 
    : IRequestHandler<UpdateBookingCommand, Result<bool>>
{
    public async Task<Result<bool>> Handle(UpdateBookingCommand request, CancellationToken cancellationToken)
    {
        if (request.Items == null || !request.Items.Any())
            return Result<bool>.Failure("A booking must contain at least one item.");

        var bookingMaster = await context.BookingMasters
            .Include(b => b.BookingChildren)
            .Include(b => b.BookingExtras)
            .FirstOrDefaultAsync(b => b.Id == request.Id, cancellationToken);

        if (bookingMaster == null)
            return Result<bool>.Failure("Booking not found");

        bookingMaster.CustomerName = request.CustomerName;
        bookingMaster.CustomerPhone = request.CustomerPhone;
        bookingMaster.PaymentStatus = string.IsNullOrWhiteSpace(request.PaymentStatus) ? "Pending" : request.PaymentStatus;
        bookingMaster.PaidAmount = request.PaidAmount;

        // Mark existing items as soft-deleted to keep history cleanly
        foreach (var child in bookingMaster.BookingChildren)
        {
            child.IsDeleted = true;
        }

        foreach (var ex in bookingMaster.BookingExtras)
        {
            ex.IsDeleted = true;
        }

        decimal grandTotal = 0;

        foreach (var item in request.Items)
        {
            var room = await context.GameRooms
                .FirstOrDefaultAsync(r => r.Id == item.GameRoomId, cancellationToken);
                
            if (room == null)
                return Result<bool>.Failure($"Game room not found: {item.GameRoomId}");

            // Calculate the exact session price using the existing Query pattern
            var amountQuery = new CalculateSessionAmountQuery(
                item.GameRoomId, 
                item.StartTime, 
                item.EndTime, 
                item.NumberOfPersons);
                
            var amountResult = await mediator.Send(amountQuery, cancellationToken);
            
            if (!amountResult.IsSuccess)
                return Result<bool>.Failure(amountResult.Error ?? "Could not calculate amount.");

            grandTotal += amountResult.Value;

            context.BookingChildren.Add(new BookingChild
            {
                GameRoomId = item.GameRoomId,
                GameCategoryId = item.GameCategoryId,
                StartTime = item.StartTime,
                EndTime = item.EndTime,
                TotalPersons = item.NumberOfPersons,
                TableRate = room.RatePerHour,
                TotalAmount = amountResult.Value,
                BookingMasterId = bookingMaster.Id
            });
        }

        if (request.Extras != null)
        {
            foreach (var extraReq in request.Extras)
            {
                var extra = await context.Extras.FirstOrDefaultAsync(e => e.Id == extraReq.ExtraId, cancellationToken);
                if (extra == null) continue;

                var extraAmount = extra.Price * extraReq.Quantity;
                grandTotal += extraAmount;

                context.BookingExtras.Add(new BookingExtra
                {
                    BookingMasterId = bookingMaster.Id,
                    ExtraId = extraReq.ExtraId,
                    Quantity = extraReq.Quantity,
                    UnitPrice = extra.Price,
                    TotalAmount = extraAmount
                });
            }
        }

        bookingMaster.TotalPayment = grandTotal;

        await context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
