namespace TournamentAPI.Models;

public class Tournament
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public DateTime? StartDate { get; set; }
    public string Status { get; set; } = "upcoming"; // upcoming, ongoing, completed
    
    // Navigation properties
    public ICollection<User> Participants { get; set; } = new List<User>();
    public Bracket? Bracket { get; set; }
}
