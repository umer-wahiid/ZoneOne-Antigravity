using MediatR;
using Microsoft.EntityFrameworkCore;
using ZoneOne.Application.Common.Interfaces;
using ZoneOne.Application.Common.Models;

namespace ZoneOne.Application.Extras.Commands;

public record UpdateExtraCommand(Guid Id, string Name, decimal Price) : IRequest<Result<bool>>;

public class UpdateExtraCommandHandler(IGamingDbContext context) : IRequestHandler<UpdateExtraCommand, Result<bool>>
{
    public async Task<Result<bool>> Handle(UpdateExtraCommand request, CancellationToken cancellationToken)
    {
        var extra = await context.Extras.FirstOrDefaultAsync(e => e.Id == request.Id, cancellationToken);

        if (extra == null)
            return Result<bool>.Failure("Extra not found");

        extra.Name = request.Name;
        extra.Price = request.Price;

        await context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
