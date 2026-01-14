# System Pucharowy API (Tournament Management API)

GraphQL API for managing knockout/cup tournaments with JWT authentication built with ASP.NET Core and HotChocolate.

## Features

- 🔐 User authentication (registration and login) with JWT
- 🏆 Tournament management with lifecycle (upcoming → ongoing → completed)
- 🎯 Automatic bracket generation with power-of-2 validation
- ⚽ Match management with automatic round progression
- 👤 User-specific match queries (get your matches without providing user ID)
- 📊 GraphQL API with HotChocolate

## Tech Stack

- **Framework**: ASP.NET Core 8.0
- **GraphQL**: HotChocolate 15.1.11
- **ORM**: Entity Framework Core 8.0
- **Database**: SQL Server
- **Authentication**: JWT Bearer
- **Password Hashing**: BCrypt.Net-Next

## Installation

1. Clone the repository:
```bash
git clone https://github.com/andrzejkaminski024-lab/System_pucharowy_API.git
cd System_pucharowy_API
```

2. Update the connection string in `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=TournamentDB;Trusted_Connection=true"
  }
}
```

3. Run Entity Framework migrations:
```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```

4. Run the application:
```bash
dotnet run
```

The GraphQL endpoint will be available at `https://localhost:5001/graphql`

## Data Models

### User
- `Id`: int (primary key)
- `FirstName`: string
- `LastName`: string
- `Email`: string (unique)
- `Password`: string (hashed with BCrypt)

### Tournament
- `Id`: int (primary key)
- `Name`: string
- `StartDate`: DateTime?
- `Status`: string (upcoming, ongoing, completed)
- `Participants`: Collection of Users (many-to-many)
- `Bracket`: Bracket (1-to-1)

### Bracket
- `Id`: int (primary key)
- `TournamentId`: int (foreign key)
- `Tournament`: Tournament (1-to-1)
- `Matches`: Collection of Matches (1-to-many)

### Match
- `Id`: int (primary key)
- `BracketId`: int (foreign key)
- `Round`: int
- `Player1Id`: int (foreign key)
- `Player2Id`: int (foreign key)
- `WinnerId`: int? (foreign key, nullable)
- `Bracket`: Bracket
- `Player1`: User
- `Player2`: User
- `Winner`: User?

## GraphQL API

### Authentication

#### Register
```graphql
mutation {
  register(
    firstName: "John"
    lastName: "Doe"
    email: "john@example.com"
    password: "password123"
  ) {
    token
    user {
      id
      firstName
      lastName
      email
    }
  }
}
```

#### Login
```graphql
mutation {
  login(email: "john@example.com", password: "password123") {
    token
    user {
      id
      firstName
      lastName
      email
    }
  }
}
```

**Important:** After login/register, use the returned token in subsequent requests by adding it to the Authorization header:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

### Queries

#### Get Current User's Matches (requires JWT)
```graphql
query {
  myMatches {
    id
    round
    player1 {
      firstName
      lastName
    }
    player2 {
      firstName
      lastName
    }
    winner {
      firstName
      lastName
    }
  }
}
```

#### Get Current User Info (requires JWT)
```graphql
query {
  me {
    id
    firstName
    lastName
    email
  }
}
```

#### Get All Tournaments
```graphql
query {
  tournaments {
    id
    name
    startDate
    status
    participants {
      firstName
      lastName
    }
  }
}
```

#### Get Matches for Round
```graphql
query {
  getMatchesForRound(bracketId: 1, round: 1) {
    id
    round
    player1 {
      firstName
      lastName
    }
    player2 {
      firstName
      lastName
    }
  }
}
```

### Mutations

#### Create Tournament
```graphql
mutation {
  createTournament(
    name: "Summer Championship 2024"
    startDate: "2024-07-01"
  ) {
    id
    name
    status
  }
}
```

#### Add Participant to Tournament
```graphql
mutation {
  addParticipant(tournamentId: 1, userId: 2) {
    id
    name
    participants {
      firstName
      lastName
    }
  }
}
```

#### Start Tournament
```graphql
mutation {
  startTournament(tournamentId: 1) {
    id
    name
    status
  }
}
```

#### Finish Tournament
```graphql
mutation {
  finishTournament(tournamentId: 1) {
    id
    name
    status
  }
}
```

#### Generate Bracket
```graphql
mutation {
  generateBracket(tournamentId: 1) {
    id
    matches {
      round
      player1 {
        firstName
        lastName
      }
      player2 {
        firstName
        lastName
      }
    }
  }
}
```

#### Play Match (sets winner and auto-creates next round)
```graphql
mutation {
  playMatch(matchId: 1, winnerId: 2) {
    id
    round
    winner {
      firstName
      lastName
    }
  }
}
```

## Key Features

### Automatic Bracket Generation
- Validates that number of participants is a power of 2 (2, 4, 8, 16, etc.)
- Creates first round matches automatically
- Pairs participants in bracket structure

### Automatic Round Progression
- When all matches in a round are completed, the next round is automatically created
- Winners advance to face each other in the next round
- Final match determines tournament champion

### Tournament Lifecycle
- **upcoming**: Tournament created but not started
- **ongoing**: Tournament in progress (after `startTournament`)
- **completed**: Tournament finished (after `finishTournament`)

## Testing with Banana Cake Pop

When the server is running, visit `https://localhost:5001/graphql` to access the Banana Cake Pop GraphQL IDE.

To test authenticated queries/mutations:
1. First, register or login to get a token
2. Click on "Headers" and add:
```json
{
  "Authorization": "Bearer YOUR_TOKEN_HERE"
}
```
3. Execute your queries/mutations

## Project Structure

```
TournamentAPI/
├── Models/              # Entity models
│   ├── User.cs
│   ├── Tournament.cs
│   ├── Bracket.cs
│   └── Match.cs
├── Data/
│   └── TournamentDbContext.cs  # EF Core DbContext
├── GraphQL/             # HotChocolate GraphQL layer
│   ├── Types/          # GraphQL object types
│   ├── Queries/        # Query resolvers
│   └── Mutations/      # Mutation resolvers
├── Services/            # Business logic
│   ├── AuthService.cs
│   └── TournamentService.cs
├── Program.cs           # Application entry point
└── appsettings.json     # Configuration
```

## Security Features

- Password hashing with BCrypt
- JWT token-based authentication
- Token expiration (7 days configurable)
- Protected routes for user-specific data

## Documentation

See `DOTNET_IMPLEMENTATION.md` for detailed implementation documentation.

## License

ISC
