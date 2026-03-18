using MediatR;
using Microsoft.EntityFrameworkCore;
using ZoneOne.Application.Common.Interfaces;

namespace ZoneOne.Application.Bookings.Queries;

public record BookingMasterDto(
    Guid Id,
    string CustomerName,
    string CustomerPhone,
    string PaymentStatus,
    decimal TotalPayment,
    decimal PaidAmount,
    DateTime CreatedAt,
    List<BookingChildDto> Items,
    List<BookingExtraDto> Extras);

public record BookingChildDto(
    Guid Id,
    Guid GameRoomId,
    string GameRoomName,
    Guid GameCategoryId,
    string GameCategoryName,
    DateTime StartTime,
    DateTime EndTime,
    int TotalPersons,
    decimal TableRate,
    decimal TotalAmount);

public record BookingExtraDto(
    Guid Id,
    Guid ExtraId,
    string ExtraName,
    int Quantity,
    decimal UnitPrice,
    decimal TotalAmount);

public record GetBookingsQuery : IRequest<List<BookingMasterDto>>;

public class GetBookingsQueryHandler(IGamingDbContext context) : IRequestHandler<GetBookingsQuery, List<BookingMasterDto>>
{
    public async Task<List<BookingMasterDto>> Handle(GetBookingsQuery request, CancellationToken cancellationToken)
    {
        var bookings = await context.BookingMasters
            .Include(b => b.BookingChildren)
                .ThenInclude(c => c.GameRoom)
            .Include(b => b.BookingChildren)
                .ThenInclude(c => c.GameCategory)
            .Include(b => b.BookingExtras)
                .ThenInclude(e => e.Extra)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync(cancellationToken);

        return bookings.Select(b => new BookingMasterDto(
            b.Id,
            b.CustomerName,
            b.CustomerPhone,
            b.PaymentStatus,
            b.TotalPayment,
            b.PaidAmount,
            b.CreatedAt,
            b.BookingChildren.Select(c => new BookingChildDto(
                c.Id,
                c.GameRoomId,
                c.GameRoom.RoomNo, 
                c.GameCategoryId,
                c.GameCategory.Name,
                c.StartTime,
                c.EndTime,
                c.TotalPersons,
                c.TableRate,
                c.TotalAmount
            )).ToList(),
            b.BookingExtras.Select(e => new BookingExtraDto(
                e.Id,
                e.ExtraId,
                e.Extra.Name,
                e.Quantity,
                e.UnitPrice,
                e.TotalAmount
            )).ToList()
        )).ToList();
    }
}
