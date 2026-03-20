using MediatR;
using ZoneOne.Application.Common.Interfaces;
using ZoneOne.Application.Common.Models;

namespace ZoneOne.Application.Features.Users.Commands;

public record DeleteUserCommand(string Id) : IRequest<Result<bool>>;

public class DeleteUserCommandHandler(IIdentityService identityService) : IRequestHandler<DeleteUserCommand, Result<bool>>
{
    public async Task<Result<bool>> Handle(DeleteUserCommand request, CancellationToken cancellationToken)
    {
        return await identityService.DeleteUserAsync(request.Id);
    }
}
