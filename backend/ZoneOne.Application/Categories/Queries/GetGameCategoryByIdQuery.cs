using MediatR;
using Microsoft.EntityFrameworkCore;
using ZoneOne.Application.Common.Interfaces;

namespace ZoneOne.Application.Categories.Queries;

public record GetGameCategoryByIdQuery(Guid Id) : IRequest<GameCategoryDto?>;

public class GetGameCategoryByIdQueryHandler(IGamingDbContext context) : IRequestHandler<GetGameCategoryByIdQuery, GameCategoryDto?>
{

    public async Task<GameCategoryDto?> Handle(GetGameCategoryByIdQuery request, CancellationToken cancellationToken)
    {
        var category = await context.GameCategories
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (category == null) return null;

        return new GameCategoryDto(
            category.Id,
            category.Name,
            category.Description);
    }
}
