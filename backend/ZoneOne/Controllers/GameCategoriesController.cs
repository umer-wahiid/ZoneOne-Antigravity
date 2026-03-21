using MediatR;
using Microsoft.AspNetCore.Mvc;
using ZoneOne.Application.Categories.Commands;
using ZoneOne.Application.Categories.Queries;

namespace ZoneOne.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GameCategoriesController(IMediator mediator) : ControllerBase
{

    [HttpGet]
    public async Task<ActionResult<IEnumerable<GameCategoryDto>>> GetCategories()
    {
        var result = await mediator.Send(new GetGameCategoriesQuery());
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<GameCategoryDto>> GetCategory(Guid id)
    {
        var result = await mediator.Send(new GetGameCategoryByIdQuery(id));
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> Create([FromBody] CreateGameCategoryCommand command)
    {
        var result = await mediator.Send(command);
        return CreatedAtAction(nameof(GetCategory), new { id = result }, result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(Guid id, [FromBody] UpdateGameCategoryCommand command)
    {
        if (id != command.Id) return BadRequest();

        var result = await mediator.Send(command);
        if (!result) return NotFound();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var result = await mediator.Send(new DeleteGameCategoryCommand(id));
        if (!result) return NotFound();

        return NoContent();
    }
}
