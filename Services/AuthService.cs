using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TournamentAPI.Data;
using TournamentAPI.Models;
using BCrypt.Net;

namespace TournamentAPI.Services;

public class AuthService : IAuthService
{
    private readonly TournamentDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(TournamentDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<(string Token, User User)?> RegisterAsync(string firstName, string lastName, string email, string password)
    {
        // Check if user already exists
        if (await _context.Users.AnyAsync(u => u.Email == email))
        {
            return null;
        }

        // Hash password
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        // Create user
        var user = new User
        {
            FirstName = firstName,
            LastName = lastName,
            Email = email,
            Password = hashedPassword
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Generate JWT token
        var token = GenerateJwtToken(user);

        return (token, user);
    }

    public async Task<(string Token, User User)?> LoginAsync(string email, string password)
    {
        // Find user by email
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null)
        {
            return null;
        }

        // Verify password
        if (!BCrypt.Net.BCrypt.Verify(password, user.Password))
        {
            return null;
        }

        // Generate JWT token
        var token = GenerateJwtToken(user);

        return (token, user);
    }

    public string GenerateJwtToken(User user)
    {
        var jwtKey = _configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not configured");
        var jwtIssuer = _configuration["Jwt:Issuer"] ?? throw new InvalidOperationException("JWT Issuer not configured");
        var jwtAudience = _configuration["Jwt:Audience"] ?? throw new InvalidOperationException("JWT Audience not configured");
        var expiryDays = int.Parse(_configuration["Jwt:ExpiryInDays"] ?? "7");

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.GivenName, user.FirstName),
            new Claim(ClaimTypes.Surname, user.LastName)
        };

        var token = new JwtSecurityToken(
            issuer: jwtIssuer,
            audience: jwtAudience,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(expiryDays),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
