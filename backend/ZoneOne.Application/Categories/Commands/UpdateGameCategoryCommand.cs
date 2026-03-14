using MediatR;
using Microsoft.EntityFrameworkCore;
using ZoneOne.Application.Common.Interfaces;

namespace ZoneOne.Application.Categories.Commands;

public record UpdateGameCategoryCommand(
    Guid Id,
    string Name,
    string Description,
    string IconUrl,
    string ThemeColor) : IRequest<bool>;

public class UpdateGameCategoryCommandHandler : IRequestHandler<UpdateGameCategoryCommand, bool>
{
    private readonly IGamingDbContext _context;

    public UpdateGameCategoryCommandHandler(IGamingDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateGameCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = await _context.GameCategories
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (category == null) return false;

        category.Name = request.Name;
        category.Description = request.Description;
        category.IconUrl = request.IconUrl;
        category.ThemeColor = request.ThemeColor;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
