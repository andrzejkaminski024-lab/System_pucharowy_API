namespace TournamentAPI.GraphQL.Types;

public class AuthPayload
{
    public string Token { get; set; } = string.Empty;
    public UserType User { get; set; } = null!;
}

public class UserType
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}
