namespace ZoneOne.Application.Common.Interfaces;

public interface ITokenService
{
    string GenerateJwtToken(string userId, string userName, string fullName, string role);
}
