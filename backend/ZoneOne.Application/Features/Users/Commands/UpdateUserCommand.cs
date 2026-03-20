using MediatR;
using ZoneOne.Application.Common.Interfaces;
using ZoneOne.Application.Common.Models;

namespace ZoneOne.Application.Features.Users.Commands;

public record UpdateUserCommand(string Id, string UserName, string FullName, string Role, string? Password) : IRequest<Result<bool>>;

public class UpdateUserCommandHandler(IIdentityService identityService) : IRequestHandler<UpdateUserCommand, Result<bool>>
{
    public async Task<Result<bool>> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {
        return await identityService.UpdateUserAsync(request.Id, request.UserName, request.FullName, request.Role, request.Password);
    }
}
