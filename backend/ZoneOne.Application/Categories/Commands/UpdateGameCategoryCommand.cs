using MediatR;
using Microsoft.EntityFrameworkCore;
using ZoneOne.Application.Common.Interfaces;

namespace ZoneOne.Application.Categories.Commands;

public record UpdateGameCategoryCommand(
    Guid Id,
    string Name,
    string Description) : IRequest<bool>;

public class UpdateGameCategoryCommandHandler(IGamingDbContext context) : IRequestHandler<UpdateGameCategoryCommand, bool>
{

    public async Task<bool> Handle(UpdateGameCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = await context.GameCategories
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (category == null) return false;

        category.Name = request.Name;
        category.Description = request.Description;

        await context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
