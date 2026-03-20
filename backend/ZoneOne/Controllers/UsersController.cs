using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ZoneOne.Application.Common.Interfaces;
using ZoneOne.Application.Features.Users.Commands;
using ZoneOne.Application.Features.Users.Queries;

namespace ZoneOne.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
public class UsersController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<UserDto>>> GetUsers()
    {
        return await mediator.Send(new GetUsersQuery());
    }

    [HttpPost]
    public async Task<ActionResult<bool>> CreateUser(CreateUserCommand command)
    {
        var result = await mediator.Send(command);
        if (!result.IsSuccess) return BadRequest(result.Error);
        return Ok(result.Value);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<bool>> UpdateUser(string id, UpdateUserCommand command)
    {
        if (id != command.Id) return BadRequest();
        var result = await mediator.Send(command);
        if (!result.IsSuccess) return BadRequest(result.Error);
        return Ok(result.Value);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<bool>> DeleteUser(string id)
    {
        var result = await mediator.Send(new DeleteUserCommand(id));
        if (!result.IsSuccess) return BadRequest(result.Error);
        return Ok(result.Value);
    }
}
