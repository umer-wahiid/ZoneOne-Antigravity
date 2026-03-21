using MediatR;
using Microsoft.EntityFrameworkCore;
using ZoneOne.Application.Common.Interfaces;

namespace ZoneOne.Application.Categories.Queries;

public record GetGameCategoriesQuery : IRequest<IEnumerable<GameCategoryDto>>;

public class GetGameCategoriesQueryHandler(IGamingDbContext context) : IRequestHandler<GetGameCategoriesQuery, IEnumerable<GameCategoryDto>>
{

    public async Task<IEnumerable<GameCategoryDto>> Handle(GetGameCategoriesQuery request, CancellationToken cancellationToken)
    {
        return await context.GameCategories
            .Select(c => new GameCategoryDto(c.Id, c.Name, c.Description))
            .ToListAsync(cancellationToken);
    }
}
