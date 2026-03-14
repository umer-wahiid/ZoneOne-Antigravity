using MediatR;
using Microsoft.EntityFrameworkCore;
using ZoneOne.Application.Common.Interfaces;

namespace ZoneOne.Application.Categories.Queries;

public record GetGameCategoriesQuery : IRequest<IEnumerable<GameCategoryDto>>;

public class GetGameCategoriesQueryHandler : IRequestHandler<GetGameCategoriesQuery, IEnumerable<GameCategoryDto>>
{
    private readonly IGamingDbContext _context;

    public GetGameCategoriesQueryHandler(IGamingDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<GameCategoryDto>> Handle(GetGameCategoriesQuery request, CancellationToken cancellationToken)
    {
        return await _context.GameCategories
            .Select(c => new GameCategoryDto(c.Id, c.Name, c.Description, c.IconUrl, c.ThemeColor))
            .ToListAsync(cancellationToken);
    }
}
