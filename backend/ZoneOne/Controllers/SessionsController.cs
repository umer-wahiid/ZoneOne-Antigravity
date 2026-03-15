using MediatR;
using Microsoft.AspNetCore.Mvc;
using ZoneOne.Application.Sessions.Commands;
using ZoneOne.Application.Sessions.Queries;

namespace ZoneOne.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SessionsController(IMediator mediator) : ControllerBase
{
    [HttpPost("calculate")]
    public async Task<ActionResult<decimal>> Calculate([FromBody] CalculateSessionAmountQuery query)
    {
        var result = await mediator.Send(query);
        if (!result.IsSuccess)
            return BadRequest(new { message = result.Error });

        return Ok(new { amount = result.Value });
    }

    [HttpPost("start")]
    public async Task<ActionResult<Guid>> Start([FromBody] CreateSessionCommand command)
    {
        var result = await mediator.Send(command);
        if (!result.IsSuccess)
            return BadRequest(new { message = result.Error });

        return Ok(new { id = result.Value });
    }

    [HttpGet("active")]
    public async Task<ActionResult<IEnumerable<SessionDto>>> GetActive()
    {
        var result = await mediator.Send(new GetActiveSessionsQuery());
        return Ok(result);
    }
}
