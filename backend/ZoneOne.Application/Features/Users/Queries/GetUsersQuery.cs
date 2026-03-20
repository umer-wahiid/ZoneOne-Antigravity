using MediatR;
using ZoneOne.Application.Common.Interfaces;

namespace ZoneOne.Application.Features.Users.Queries;

public record GetUsersQuery : IRequest<List<UserDto>>;

public class GetUsersQueryHandler(IIdentityService identityService) : IRequestHandler<GetUsersQuery, List<UserDto>>
{
    public async Task<List<UserDto>> Handle(GetUsersQuery request, CancellationToken cancellationToken)
    {
        return await identityService.GetUsersAsync();
    }
}
