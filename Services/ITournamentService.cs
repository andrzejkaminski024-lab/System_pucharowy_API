using TournamentAPI.Models;

namespace TournamentAPI.Services;

public interface ITournamentService
{
    Task<Bracket> GenerateBracketAsync(int tournamentId);
    Task<Match> PlayMatchAsync(int matchId, int winnerId);
}
