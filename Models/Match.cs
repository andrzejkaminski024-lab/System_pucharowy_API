namespace TournamentAPI.Models;

public class Match
{
    public int Id { get; set; }
    public int BracketId { get; set; }
    public int Round { get; set; }
    public int Player1Id { get; set; }
    public int Player2Id { get; set; }
    public int? WinnerId { get; set; }
    
    // Navigation properties
    public Bracket Bracket { get; set; } = null!;
    public User Player1 { get; set; } = null!;
    public User Player2 { get; set; } = null!;
    public User? Winner { get; set; }
}
