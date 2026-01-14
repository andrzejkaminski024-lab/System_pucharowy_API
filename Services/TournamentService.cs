using Microsoft.EntityFrameworkCore;
using TournamentAPI.Data;
using TournamentAPI.Models;

namespace TournamentAPI.Services;

public class TournamentService : ITournamentService
{
    private readonly TournamentDbContext _context;

    public TournamentService(TournamentDbContext context)
    {
        _context = context;
    }

    public async Task<Bracket> GenerateBracketAsync(int tournamentId)
    {
        var tournament = await _context.Tournaments
            .Include(t => t.Participants)
            .Include(t => t.Bracket)
            .FirstOrDefaultAsync(t => t.Id == tournamentId);

        if (tournament == null)
        {
            throw new ArgumentException("Tournament not found");
        }

        if (tournament.Bracket != null)
        {
            throw new InvalidOperationException("Bracket already exists for this tournament");
        }

        var participantCount = tournament.Participants.Count;
        
        // Validate power of 2
        if (participantCount < 2 || (participantCount & (participantCount - 1)) != 0)
        {
            throw new InvalidOperationException("Number of participants must be a power of 2 (2, 4, 8, 16, etc.)");
        }

        // Create bracket
        var bracket = new Bracket
        {
            TournamentId = tournamentId
        };

        _context.Brackets.Add(bracket);
        await _context.SaveChangesAsync();

        // Create first round matches
        var participants = tournament.Participants.ToList();
        var matches = new List<Match>();

        for (int i = 0; i < participantCount; i += 2)
        {
            var match = new Match
            {
                BracketId = bracket.Id,
                Round = 1,
                Player1Id = participants[i].Id,
                Player2Id = participants[i + 1].Id
            };
            matches.Add(match);
        }

        _context.Matches.AddRange(matches);
        await _context.SaveChangesAsync();

        return bracket;
    }

    public async Task<Match> PlayMatchAsync(int matchId, int winnerId)
    {
        var match = await _context.Matches
            .Include(m => m.Bracket)
            .ThenInclude(b => b.Matches)
            .FirstOrDefaultAsync(m => m.Id == matchId);

        if (match == null)
        {
            throw new ArgumentException("Match not found");
        }

        if (match.WinnerId.HasValue)
        {
            throw new InvalidOperationException("Match already has a winner");
        }

        if (winnerId != match.Player1Id && winnerId != match.Player2Id)
        {
            throw new ArgumentException("Winner must be one of the match players");
        }

        // Set winner
        match.WinnerId = winnerId;
        await _context.SaveChangesAsync();

        // Check if all matches in current round are complete
        var currentRoundMatches = match.Bracket.Matches
            .Where(m => m.Round == match.Round)
            .ToList();

        if (currentRoundMatches.All(m => m.WinnerId.HasValue))
        {
            // Create next round matches
            var winners = currentRoundMatches
                .Select(m => m.WinnerId!.Value)
                .ToList();

            if (winners.Count > 1)
            {
                var nextRoundMatches = new List<Match>();
                for (int i = 0; i < winners.Count; i += 2)
                {
                    var nextMatch = new Match
                    {
                        BracketId = match.BracketId,
                        Round = match.Round + 1,
                        Player1Id = winners[i],
                        Player2Id = winners[i + 1]
                    };
                    nextRoundMatches.Add(nextMatch);
                }

                _context.Matches.AddRange(nextRoundMatches);
                await _context.SaveChangesAsync();
            }
        }

        return match;
    }
}
