using MediatR;
using ZoneOne.Application.Common.Models;

namespace ZoneOne.Application.Features.Auth.Commands;

public record LoginCommand(string UserName, string Password) : IRequest<Result<AuthResponseDto>>;
