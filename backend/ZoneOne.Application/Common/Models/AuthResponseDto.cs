using ZoneOne.Domain.Enums;

namespace ZoneOne.Application.Common.Models;

public record AuthResponseDto(
    string Id,
    string UserName,
    string FullName,
    UserRole Role,
    string Token);
