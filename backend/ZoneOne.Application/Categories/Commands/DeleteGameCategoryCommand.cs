using MediatR;
using Microsoft.EntityFrameworkCore;
using ZoneOne.Application.Common.Interfaces;

namespace ZoneOne.Application.Categories.Commands;

public record DeleteGameCategoryCommand(Guid Id) : IRequest<bool>;

public class DeleteGameCategoryCommandHandler : IRequestHandler<DeleteGameCategoryCommand, bool>
{
    private readonly IGamingDbContext _context;

    public DeleteGameCategoryCommandHandler(IGamingDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteGameCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = await _context.GameCategories
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (category == null) return false;

        _context.GameCategories.Remove(category);
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
