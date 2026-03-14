using MediatR;
using ZoneOne.Application.Common.Interfaces;
using ZoneOne.Domain.Entities;

namespace ZoneOne.Application.Categories.Commands;

public record CreateGameCategoryCommand(
    string Name,
    string Description,
    string IconUrl,
    string ThemeColor) : IRequest<Guid>;

public class CreateGameCategoryCommandHandler : IRequestHandler<CreateGameCategoryCommand, Guid>
{
    private readonly IGamingDbContext _context;

    public CreateGameCategoryCommandHandler(IGamingDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateGameCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = new GameCategory
        {
            Name = request.Name,
            Description = request.Description,
            IconUrl = request.IconUrl,
            ThemeColor = request.ThemeColor
        };

        _context.GameCategories.Add(category);
        await _context.SaveChangesAsync(cancellationToken);

        return category.Id;
    }
}
