using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TournamentAPI.Data;
using TournamentAPI.Models;

namespace TournamentAPI.GraphQL.Queries;

public class Query
{
    public async Task<List<Tournament>> GetTournamentsAsync([Service] TournamentDbContext context)
    {
        return await context.Tournaments
            .Include(t => t.Participants)
            .Include(t => t.Bracket)
            .ToListAsync();
    }

    public async Task<Tournament?> GetTournamentAsync(int id, [Service] TournamentDbContext context)
    {
        return await context.Tournaments
            .Include(t => t.Participants)
            .Include(t => t.Bracket)
            .FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task<Bracket?> GetBracketAsync(int tournamentId, [Service] TournamentDbContext context)
    {
        return await context.Brackets
            .Include(b => b.Matches)
            .ThenInclude(m => m.Player1)
            .Include(b => b.Matches)
            .ThenInclude(m => m.Player2)
            .Include(b => b.Matches)
            .ThenInclude(m => m.Winner)
            .FirstOrDefaultAsync(b => b.TournamentId == tournamentId);
    }

    public async Task<List<Match>> GetMatchesForRoundAsync(int bracketId, int round, [Service] TournamentDbContext context)
    {
        return await context.Matches
            .Include(m => m.Player1)
            .Include(m => m.Player2)
            .Include(m => m.Winner)
            .Where(m => m.BracketId == bracketId && m.Round == round)
            .ToListAsync();
    }

    public async Task<List<Match>> GetMyMatchesAsync(ClaimsPrincipal claimsPrincipal, [Service] TournamentDbContext context)
    {
        var userIdClaim = claimsPrincipal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
        {
            throw new UnauthorizedAccessException("User not authenticated");
        }

        return await context.Matches
            .Include(m => m.Bracket)
            .ThenInclude(b => b.Tournament)
            .Include(m => m.Player1)
            .Include(m => m.Player2)
            .Include(m => m.Winner)
            .Where(m => m.Player1Id == userId || m.Player2Id == userId)
            .ToListAsync();
    }

    public async Task<User?> GetMeAsync(ClaimsPrincipal claimsPrincipal, [Service] TournamentDbContext context)
    {
        var userIdClaim = claimsPrincipal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
        {
            throw new UnauthorizedAccessException("User not authenticated");
        }

        return await context.Users.FirstOrDefaultAsync(u => u.Id == userId);
    }
}
