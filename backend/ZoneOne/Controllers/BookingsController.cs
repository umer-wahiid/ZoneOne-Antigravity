using MediatR;
using Microsoft.AspNetCore.Mvc;
using ZoneOne.Application.Bookings.Commands;
using ZoneOne.Application.Sessions.Queries;
using ZoneOne.Application.Bookings.Queries;

namespace ZoneOne.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingsController(IMediator mediator) : ControllerBase
{
    [HttpPost("calculate")]
    public async Task<ActionResult<decimal>> Calculate([FromBody] CalculateSessionAmountQuery query)
    {
        var result = await mediator.Send(query);
        if (!result.IsSuccess)
            return BadRequest(new { message = result.Error });

        return Ok(new { amount = result.Value });
    }

    [HttpPost("check-overlap")]
    public async Task<ActionResult> CheckOverlap([FromBody] CheckOverlapQuery query)
    {
        var result = await mediator.Send(query);
        if (!result.IsSuccess)
            return BadRequest(new { message = result.Error });

        return Ok();
    }

    [HttpPost("checkout")]
    public async Task<ActionResult<Guid>> Checkout([FromBody] CreateBookingCommand command)
    {
        var result = await mediator.Send(command);
        if (!result.IsSuccess)
            return BadRequest(new { message = result.Error });

        return Ok(new { id = result.Value });
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateBooking(Guid id, [FromBody] UpdateBookingCommand command)
    {
        if (id != command.Id)
            return BadRequest(new { message = "Mismatched Booking ID" });

        var result = await mediator.Send(command);
        if (!result.IsSuccess)
            return BadRequest(new { message = result.Error });

        return NoContent();
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BookingMasterDto>>> GetBookings()
    {
        var result = await mediator.Send(new GetBookingsQuery());
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteBooking(Guid id)
    {
        var result = await mediator.Send(new DeleteBookingCommand(id));
        if (!result.IsSuccess)
            return BadRequest(new { message = result.Error });

        return NoContent();
    }
}
