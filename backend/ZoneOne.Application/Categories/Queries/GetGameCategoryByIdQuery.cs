using MediatR;
using Microsoft.EntityFrameworkCore;
using ZoneOne.Application.Common.Interfaces;

namespace ZoneOne.Application.Categories.Queries;

public record GetGameCategoryByIdQuery(Guid Id) : IRequest<GameCategoryDto?>;

public class GetGameCategoryByIdQueryHandler : IRequestHandler<GetGameCategoryByIdQuery, GameCategoryDto?>
{
    private readonly IGamingDbContext _context;

    public GetGameCategoryByIdQueryHandler(IGamingDbContext context)
    {
        _context = context;
    }

    public async Task<GameCategoryDto?> Handle(GetGameCategoryByIdQuery request, CancellationToken cancellationToken)
    {
        var category = await _context.GameCategories
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (category == null) return null;

        return new GameCategoryDto(
            category.Id,
            category.Name,
            category.Description,
            category.IconUrl,
            category.ThemeColor);
    }
}
