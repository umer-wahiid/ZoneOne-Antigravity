using Microsoft.AspNetCore.Mvc;
using MediatR;
using ZoneOne.Application.Features.Auth.Commands;
using ZoneOne.Application.Common.Models;

namespace ZoneOne.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IMediator mediator) : ControllerBase
{
    [HttpPost("login")]
    public async Task<ActionResult<Result<AuthResponseDto>>> Login(LoginCommand command)
    {
        var result = await mediator.Send(command);
        if (!result.IsSuccess)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }
}
