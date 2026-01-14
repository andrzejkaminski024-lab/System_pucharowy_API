using Microsoft.EntityFrameworkCore;
using TournamentAPI.Models;

namespace TournamentAPI.Data;

public class TournamentDbContext : DbContext
{
    public TournamentDbContext(DbContextOptions<TournamentDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Tournament> Tournaments { get; set; }
    public DbSet<Bracket> Brackets { get; set; }
    public DbSet<Match> Matches { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Password).IsRequired();
        });

        // Tournament configuration
        modelBuilder.Entity<Tournament>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Status).HasMaxLength(20);
            
            // Many-to-many relationship with Users
            entity.HasMany(t => t.Participants)
                  .WithMany(u => u.TournamentsAsParticipant)
                  .UsingEntity(j => j.ToTable("TournamentParticipants"));
        });

        // Bracket configuration
        modelBuilder.Entity<Bracket>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(b => b.Tournament)
                  .WithOne(t => t.Bracket)
                  .HasForeignKey<Bracket>(b => b.TournamentId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Match configuration
        modelBuilder.Entity<Match>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Round).IsRequired();
            
            entity.HasOne(m => m.Bracket)
                  .WithMany(b => b.Matches)
                  .HasForeignKey(m => m.BracketId)
                  .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasOne(m => m.Player1)
                  .WithMany(u => u.MatchesAsPlayer1)
                  .HasForeignKey(m => m.Player1Id)
                  .OnDelete(DeleteBehavior.Restrict);
            
            entity.HasOne(m => m.Player2)
                  .WithMany(u => u.MatchesAsPlayer2)
                  .HasForeignKey(m => m.Player2Id)
                  .OnDelete(DeleteBehavior.Restrict);
            
            entity.HasOne(m => m.Winner)
                  .WithMany(u => u.MatchesAsWinner)
                  .HasForeignKey(m => m.WinnerId)
                  .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
