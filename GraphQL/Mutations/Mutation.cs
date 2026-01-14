using Microsoft.EntityFrameworkCore;
using TournamentAPI.Data;
using TournamentAPI.GraphQL.Types;
using TournamentAPI.Models;
using TournamentAPI.Services;

namespace TournamentAPI.GraphQL.Mutations;

public class Mutation
{
    // Authentication
    public async Task<AuthPayload?> RegisterAsync(
        string firstName,
        string lastName,
        string email,
        string password,
        [Service] IAuthService authService)
    {
        var result = await authService.RegisterAsync(firstName, lastName, email, password);
        if (result == null)
        {
            return null;
        }

        return new AuthPayload
        {
            Token = result.Value.Token,
            User = new UserType
            {
                Id = result.Value.User.Id,
                FirstName = result.Value.User.FirstName,
                LastName = result.Value.User.LastName,
                Email = result.Value.User.Email
            }
        };
    }

    public async Task<AuthPayload?> LoginAsync(
        string email,
        string password,
        [Service] IAuthService authService)
    {
        var result = await authService.LoginAsync(email, password);
        if (result == null)
        {
            return null;
        }

        return new AuthPayload
        {
            Token = result.Value.Token,
            User = new UserType
            {
                Id = result.Value.User.Id,
                FirstName = result.Value.User.FirstName,
                LastName = result.Value.User.LastName,
                Email = result.Value.User.Email
            }
        };
    }

    // Tournament Management
    public async Task<Tournament> CreateTournamentAsync(
        string name,
        DateTime? startDate,
        [Service] TournamentDbContext context)
    {
        var tournament = new Tournament
        {
            Name = name,
            StartDate = startDate,
            Status = "upcoming"
        };

        context.Tournaments.Add(tournament);
        await context.SaveChangesAsync();

        return tournament;
    }

    public async Task<Tournament?> AddParticipantAsync(
        int tournamentId,
        int userId,
        [Service] TournamentDbContext context)
    {
        var tournament = await context.Tournaments
            .Include(t => t.Participants)
            .FirstOrDefaultAsync(t => t.Id == tournamentId);

        if (tournament == null)
        {
            return null;
        }

        var user = await context.Users.FindAsync(userId);
        if (user == null)
        {
            return null;
        }

        if (!tournament.Participants.Contains(user))
        {
            tournament.Participants.Add(user);
            await context.SaveChangesAsync();
        }

        return tournament;
    }

    public async Task<Tournament?> StartTournamentAsync(
        int tournamentId,
        [Service] TournamentDbContext context)
    {
        var tournament = await context.Tournaments.FindAsync(tournamentId);
        if (tournament == null)
        {
            return null;
        }

        tournament.Status = "ongoing";
        await context.SaveChangesAsync();

        return tournament;
    }

    public async Task<Tournament?> FinishTournamentAsync(
        int tournamentId,
        [Service] TournamentDbContext context)
    {
        var tournament = await context.Tournaments.FindAsync(tournamentId);
        if (tournament == null)
        {
            return null;
        }

        tournament.Status = "completed";
        await context.SaveChangesAsync();

        return tournament;
    }

    // Bracket Management
    public async Task<Bracket> GenerateBracketAsync(
        int tournamentId,
        [Service] ITournamentService tournamentService)
    {
        return await tournamentService.GenerateBracketAsync(tournamentId);
    }

    // Match Management
    public async Task<Match> PlayMatchAsync(
        int matchId,
        int winnerId,
        [Service] ITournamentService tournamentService)
    {
        return await tournamentService.PlayMatchAsync(matchId, winnerId);
    }
}
