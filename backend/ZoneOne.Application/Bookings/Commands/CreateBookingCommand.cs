using MediatR;
using Microsoft.EntityFrameworkCore;
using ZoneOne.Application.Common.Interfaces;
using ZoneOne.Application.Common.Models;
using ZoneOne.Domain.Entities;
using ZoneOne.Application.Sessions.Queries;

namespace ZoneOne.Application.Bookings.Commands;

public record BookingItemCommand(
    Guid GameRoomId,
    Guid GameCategoryId,
    DateTime StartTime,
    DateTime EndTime,
    int NumberOfPersons);

public record BookingExtraCommand(
    Guid ExtraId,
    int Quantity);

public record CreateBookingCommand(
    string CustomerName,
    string CustomerPhone,
    string PaymentStatus,
    decimal PaidAmount,
    List<BookingItemCommand> Items,
    List<BookingExtraCommand>? Extras = null) : IRequest<Result<Guid>>;

public class CreateBookingCommandHandler(IGamingDbContext context, IMediator mediator, ICurrentUserService currentUserService) 
    : IRequestHandler<CreateBookingCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateBookingCommand request, CancellationToken cancellationToken)
    {
        if (request.Items == null || !request.Items.Any())
            return Result<Guid>.Failure("A booking must contain at least one item.");

        var currentUser = currentUserService.UserName ?? "System";

        var bookingMaster = new BookingMaster
        {
            CustomerName = request.CustomerName,
            CustomerPhone = request.CustomerPhone,
            PaymentStatus = string.IsNullOrWhiteSpace(request.PaymentStatus) ? "Pending" : request.PaymentStatus,
            PaidAmount = request.PaidAmount,
            TotalPayment = 0, // Calculated below
            CreatedBy = currentUser,
            UpdatedBy = currentUser,
            UpdatedAt = DateTime.UtcNow
        };

        decimal grandTotal = 0;

        foreach (var item in request.Items)
        {
            var room = await context.GameRooms
                .FirstOrDefaultAsync(r => r.Id == item.GameRoomId, cancellationToken);
                
            if (room == null)
                return Result<Guid>.Failure($"Game room not found: {item.GameRoomId}");

            // Calculate the exact session price using the existing Query pattern
            var amountQuery = new CalculateSessionAmountQuery(
                item.GameRoomId, 
                item.StartTime, 
                item.EndTime, 
                item.NumberOfPersons);
                
            var amountResult = await mediator.Send(amountQuery, cancellationToken);
            
            if (!amountResult.IsSuccess)
                return Result<Guid>.Failure(amountResult.Error ?? "Could not calculate amount.");

            grandTotal += amountResult.Value;

            bookingMaster.BookingChildren.Add(new BookingChild
            {
                GameRoomId = item.GameRoomId,
                GameCategoryId = item.GameCategoryId,
                StartTime = item.StartTime,
                EndTime = item.EndTime,
                TotalPersons = item.NumberOfPersons,
                TableRate = room.RatePerHour,
                TotalAmount = amountResult.Value
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

                bookingMaster.BookingExtras.Add(new BookingExtra
                {
                    ExtraId = extraReq.ExtraId,
                    Quantity = extraReq.Quantity,
                    UnitPrice = extra.Price,
                    TotalAmount = extraAmount
                });
            }
        }

        bookingMaster.TotalPayment = grandTotal;

        context.BookingMasters.Add(bookingMaster);
        await context.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(bookingMaster.Id);
    }
}
