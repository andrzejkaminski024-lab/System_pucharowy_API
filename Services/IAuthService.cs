using TournamentAPI.Models;

namespace TournamentAPI.Services;

public interface IAuthService
{
    Task<(string Token, User User)?> RegisterAsync(string firstName, string lastName, string email, string password);
    Task<(string Token, User User)?> LoginAsync(string email, string password);
    string GenerateJwtToken(User user);
}
