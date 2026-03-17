using MediatR;
using ZoneOne.Application.Common.Interfaces;
using ZoneOne.Application.Common.Models;
using ZoneOne.Domain.Entities;

namespace ZoneOne.Application.Extras.Commands;

public record CreateExtraCommand(string Name, decimal Price) : IRequest<Result<Guid>>;

public class CreateExtraCommandHandler(IGamingDbContext context) : IRequestHandler<CreateExtraCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateExtraCommand request, CancellationToken cancellationToken)
    {
        var extra = new Extra
        {
            Name = request.Name,
            Price = request.Price
        };

        context.Extras.Add(extra);
        await context.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(extra.Id);
    }
}
