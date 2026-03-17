using MediatR;
using Microsoft.EntityFrameworkCore;
using ZoneOne.Application.Common.Interfaces;
using ZoneOne.Application.Common.Models;

namespace ZoneOne.Application.Extras.Commands;

public record DeleteExtraCommand(Guid Id) : IRequest<Result<bool>>;

public class DeleteExtraCommandHandler(IGamingDbContext context) : IRequestHandler<DeleteExtraCommand, Result<bool>>
{
    public async Task<Result<bool>> Handle(DeleteExtraCommand request, CancellationToken cancellationToken)
    {
        var extra = await context.Extras.FirstOrDefaultAsync(e => e.Id == request.Id, cancellationToken);

        if (extra == null)
            return Result<bool>.Failure("Extra not found");

        extra.IsDeleted = true;

        await context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
