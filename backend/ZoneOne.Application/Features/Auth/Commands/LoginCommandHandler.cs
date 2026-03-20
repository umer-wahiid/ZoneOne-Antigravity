using MediatR;
using ZoneOne.Application.Common.Interfaces;
using ZoneOne.Application.Common.Models;

namespace ZoneOne.Application.Features.Auth.Commands;

public class LoginCommandHandler(IIdentityService identityService) : IRequestHandler<LoginCommand, Result<AuthResponseDto>>
{
    public async Task<Result<AuthResponseDto>> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        return await identityService.LoginAsync(request.UserName, request.Password);
    }
}
