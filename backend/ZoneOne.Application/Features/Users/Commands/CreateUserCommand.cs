using MediatR;
using ZoneOne.Application.Common.Interfaces;
using ZoneOne.Application.Common.Models;

namespace ZoneOne.Application.Features.Users.Commands;

public record CreateUserCommand(string UserName, string Password, string FullName, string Role) : IRequest<Result<bool>>;

public class CreateUserCommandHandler(IIdentityService identityService) : IRequestHandler<CreateUserCommand, Result<bool>>
{
    public async Task<Result<bool>> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        return await identityService.CreateUserAsync(request.UserName, request.Password, request.FullName, request.Role);
    }
}
