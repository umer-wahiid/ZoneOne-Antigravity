using MediatR;
using Microsoft.EntityFrameworkCore;
using ZoneOne.Application.Common.Interfaces;

namespace ZoneOne.Application.GameRooms.Commands;

public record DeleteGameRoomCommand(Guid Id) : IRequest<bool>;

public class DeleteGameRoomCommandHandler : IRequestHandler<DeleteGameRoomCommand, bool>
{
    private readonly IGamingDbContext _context;

    public DeleteGameRoomCommandHandler(IGamingDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteGameRoomCommand request, CancellationToken cancellationToken)
    {
        var room = await _context.GameRooms
            .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken);

        if (room == null) return false;

        // Soft delete
        room.IsDeleted = true;
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
