using MediatR;
using ZoneOne.Application.Common.Interfaces;
using ZoneOne.Domain.Entities;

namespace ZoneOne.Application.Categories.Commands;

public record CreateGameCategoryCommand(
    string Name,
    string Description) : IRequest<Guid>;

public class CreateGameCategoryCommandHandler(IGamingDbContext context) : IRequestHandler<CreateGameCategoryCommand, Guid>
{

    public async Task<Guid> Handle(CreateGameCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = new GameCategory
        {
            Name = request.Name,
            Description = request.Description
        };

        context.GameCategories.Add(category);
        await context.SaveChangesAsync(cancellationToken);

        return category.Id;
    }
}
