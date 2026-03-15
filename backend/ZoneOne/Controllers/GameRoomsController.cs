using MediatR;
using Microsoft.AspNetCore.Mvc;
using ZoneOne.Application.GameRooms.Commands;
using ZoneOne.Application.GameRooms.Queries;

namespace ZoneOne.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GameRoomsController : ControllerBase
{
    private readonly IMediator _mediator;

    public GameRoomsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<GameRoomDto>>> GetRooms()
    {
        var result = await _mediator.Send(new GetGameRoomsQuery());
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<GameRoomDto>> GetRoom(Guid id)
    {
        var result = await _mediator.Send(new GetGameRoomByIdQuery(id));
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> Create([FromBody] CreateGameRoomCommand command)
    {
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetRoom), new { id = result }, result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(Guid id, [FromBody] UpdateGameRoomCommand command)
    {
        if (id != command.Id) return BadRequest();

        var result = await _mediator.Send(command);
        if (!result) return NotFound();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var result = await _mediator.Send(new DeleteGameRoomCommand(id));
        if (!result) return NotFound();

        return NoContent();
    }
}
