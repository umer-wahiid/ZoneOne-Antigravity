using MediatR;
using Microsoft.EntityFrameworkCore;
using ZoneOne.Application.Common.Interfaces;

namespace ZoneOne.Application.Extras.Queries;

public record GetExtrasQuery : IRequest<List<ExtraDto>>;

public class GetExtrasQueryHandler(IGamingDbContext context) : IRequestHandler<GetExtrasQuery, List<ExtraDto>>
{
    public async Task<List<ExtraDto>> Handle(GetExtrasQuery request, CancellationToken cancellationToken)
    {
        return await context.Extras
            .OrderBy(e => e.Name)
            .Select(e => new ExtraDto(e.Id, e.Name, e.Price))
            .ToListAsync(cancellationToken);
    }
}
