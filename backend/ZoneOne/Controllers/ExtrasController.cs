using MediatR;
using Microsoft.AspNetCore.Mvc;
using ZoneOne.Application.Extras.Commands;
using ZoneOne.Application.Extras.Queries;

namespace ZoneOne.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExtrasController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<ExtraDto>>> GetExtras()
    {
        return await mediator.Send(new GetExtrasQuery());
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> Create([FromBody] CreateExtraCommand command)
    {
        var result = await mediator.Send(command);
        if (!result.IsSuccess) return BadRequest(result.Error);
        return Ok(result.Value);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(Guid id, [FromBody] UpdateExtraCommand command)
    {
        if (id != command.Id) return BadRequest("Mismatched ID");
        var result = await mediator.Send(command);
        if (!result.IsSuccess) return BadRequest(result.Error);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var result = await mediator.Send(new DeleteExtraCommand(id));
        if (!result.IsSuccess) return BadRequest(result.Error);
        return NoContent();
    }
}
