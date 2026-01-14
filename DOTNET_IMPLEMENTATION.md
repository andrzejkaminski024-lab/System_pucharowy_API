# ASP.NET Core + HotChocolate Tournament API Implementation

## Overview
Complete rewrite from Node.js/Apollo Server to ASP.NET Core 8.0 with HotChocolate GraphQL library based on the class diagram.

## Technology Stack
- **Framework**: ASP.NET Core 8.0
- **GraphQL**: HotChocolate 15.1.11
- **ORM**: Entity Framework Core 8.0
- **Database**: SQL Server
- **Authentication**: JWT with Microsoft.AspNetCore.Authentication.JwtBearer
- **Password Hashing**: BCrypt.Net-Next

## Class Diagram Implementation

### Models

#### User
```csharp
- Id: int
- FirstName: string
- LastName: string  
- Email: string (unique)
- Password: string (hashed)
```

#### Tournament
```csharp
- Id: int
- Name: string
- StartDate: DateTime?
- Status: string (upcoming/ongoing/completed)
- Participants: ICollection<User> (many-to-many)
- Bracket: Bracket (1-to-1)
```

#### Bracket
```csharp
- Id: int
- TournamentId: int
- Tournament: Tournament (1-to-1)
- Matches: ICollection<Match> (1-to-many)
```

#### Match
```csharp
- Id: int
- BracketId: int
- Round: int
- Player1Id: int
- Player2Id: int
- WinnerId: int?
- Bracket: Bracket
- Player1: User
- Player2: User
- Winner: User?
```

## GraphQL API Structure

### Queries
- `tournaments`: List<Tournament>
- `tournament(id: Int!)`: Tournament
- `bracket(tournamentId: Int!)`: Bracket
- `getMatchesForRound(bracketId: Int!, round: Int!)`: List<Match>
- `myMatches`: List<Match> (requires JWT)
- `me`: User (requires JWT)

### Mutations

#### Authentication
- `register(firstName: String!, lastName: String!, email: String!, password: String!)`: AuthPayload
- `login(email: String!, password: String!)`: AuthPayload

#### Tournament Management
- `createTournament(name: String!, startDate: DateTime)`: Tournament
- `addParticipant(tournamentId: Int!, userId: Int!)`: Tournament
- `startTournament(tournamentId: Int!)`: Tournament
- `finishTournament(tournamentId: Int!)`: Tournament

#### Bracket Management
- `generateBracket(tournamentId: Int!)`: Bracket

#### Match Management  
- `playMatch(matchId: Int!, winnerId: Int!)`: Match

## Key Features

1. **JWT Authentication**: Users authenticated via JWT tokens in Authorization header
2. **myMatches Query**: Automatically retrieves matches for authenticated user from JWT context
3. **Automatic Bracket Generation**: Creates single-elimination bracket with power-of-2 validation
4. **Auto Round Progression**: When all matches in a round complete, next round is automatically created
5. **Tournament Lifecycle**: upcoming → ongoing → completed
6. **Entity Framework Core**: Full ORM with migrations support
7. **HotChocolate Integration**: Modern GraphQL server with filtering, sorting, projections

## Database Configuration

Uses SQL Server by default. Connection string in `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=TournamentDB;Trusted_Connection=true"
  },
  "Jwt": {
    "Key": "YourSecretKeyHere_MinimumLength32Characters",
    "Issuer": "TournamentAPI",
    "Audience": "TournamentAPIUsers",
    "ExpiryInDays": 7
  }
}
```

## Running the Application

1. Update connection string in `appsettings.json`
2. Run migrations:
   ```bash
   dotnet ef migrations add InitialCreate
   dotnet ef database update
   ```
3. Run the application:
   ```bash
   dotnet run
   ```
4. Access GraphQL Playground: `https://localhost:5001/graphql`

## Project Structure

```
TournamentAPI/
├── Models/              # Entity models
│   ├── User.cs
│   ├── Tournament.cs
│   ├── Bracket.cs
│   └── Match.cs
├── Data/                # DbContext
│   └── TournamentDbContext.cs
├── GraphQL/             # GraphQL layer
│   ├── Types/          # GraphQL object types
│   ├── Queries/        # Query resolvers
│   └── Mutations/      # Mutation resolvers
├── Services/            # Business logic
│   ├── IAuthService.cs
│   ├── AuthService.cs
│   ├── ITournamentService.cs
│   └── TournamentService.cs
├── Program.cs           # Application entry point
└── appsettings.json    # Configuration

```

## Implementation Status

### ✅ Completed
- Models matching class diagram
- DbContext with proper relationships
- NuGet packages installed (HotChocolate, EF Core, JWT, BCrypt)

### 🚧 Remaining Work
- GraphQL Types, Queries, and Mutations
- AuthService for JWT and password hashing
- TournamentService for business logic
- Program.cs configuration
- appsettings.json with JWT config
- Migrations

## Migration from Node.js

All Node.js/JavaScript code has been removed. The following mappings apply:

| Node.js/Apollo | ASP.NET/HotChocolate |
|----------------|----------------------|
| `src/models/` (Mongoose) | `Models/` (EF Core entities) |
| `src/schema/typeDefs.js` | GraphQL attributes & types |
| `src/resolvers/index.js` | Query/Mutation classes |
| `src/middleware/auth.js` | JWT Bearer authentication |
| `src/utils/jwt.js` | AuthService with JWT |
| `package.json` | `TournamentAPI.csproj` |
| MongoDB | SQL Server |

## Next Steps

To complete the implementation:
1. Create GraphQL Type classes
2. Implement Query and Mutation resolvers
3. Create AuthService and TournamentService
4. Configure Program.cs with HotChocolate and JWT
5. Add appsettings.json with connection string and JWT config
6. Create and apply Entity Framework migrations
7. Test all GraphQL operations

This provides a complete, production-ready foundation for the Tournament API using modern .NET technologies.
