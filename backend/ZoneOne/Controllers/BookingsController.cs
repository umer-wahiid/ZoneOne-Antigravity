using MediatR;
using Microsoft.AspNetCore.Mvc;
using ZoneOne.Application.Bookings.Commands;
using ZoneOne.Application.Sessions.Queries;

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

    [HttpPost("checkout")]
    public async Task<ActionResult<Guid>> Checkout([FromBody] CreateBookingCommand command)
    {
        var result = await mediator.Send(command);
        if (!result.IsSuccess)
            return BadRequest(new { message = result.Error });

        return Ok(new { id = result.Value });
    }
}
