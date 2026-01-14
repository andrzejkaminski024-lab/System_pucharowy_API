# Class Diagram Implementation

This document describes how the class diagram has been implemented in the GraphQL API.

## Models

### User
- **Attributes**:
  - `id`: int (MongoDB ObjectId)
  - `firstName`: String
  - `lastName`: String
  - `email`: String (unique)
  - `password`: String (hashed with bcryptjs)

### Tournament
- **Attributes**:
  - `id`: int (MongoDB ObjectId)
  - `name`: String
  - `startDate`: Date
  - `status`: String (upcoming, ongoing, completed)
  - `participants`: List<User> (many-to-many relationship)
  
- **Methods** (implemented as GraphQL mutations):
  - `addParticipant(tournamentId, userId)`: Adds a user to the tournament
  - `startTournament(tournamentId)`: Changes status to 'ongoing'
  - `finishTournament(tournamentId)`: Changes status to 'completed'

### Bracket
- **Attributes**:
  - `id`: int (MongoDB ObjectId)
  - `tournament`: Tournament (1-to-1 relationship)
  - `matches`: List<Match> (1-to-many relationship)
  
- **Methods** (implemented as GraphQL mutations/queries):
  - `generateBracket(tournamentId)`: Creates bracket and first round matches for a tournament
  - `getMatchesForRound(bracketId, round)`: Returns matches for a specific round

### Match
- **Attributes**:
  - `id`: int (MongoDB ObjectId)
  - `bracket`: Bracket (many-to-1 relationship)
  - `round`: int
  - `player1`: User
  - `player2`: User
  - `winner`: User (nullable)
  
- **Methods** (implemented as GraphQL mutation):
  - `playMatch(matchId, winnerId)`: Sets the winner and automatically creates next round matches

## Key Features

1. **Tournament Lifecycle**: Tournaments progress through states: upcoming → ongoing → completed
2. **Participant Management**: Users can be added to tournaments before they start
3. **Bracket Generation**: Automatically creates single-elimination bracket with proper pairings
4. **Automatic Match Progression**: When all matches in a round complete, next round is automatically created
5. **Round-based Structure**: Matches are organized by round number (1, 2, 3, etc.)

## Relationships

- User **participates in** Tournament (many-to-many)
- Tournament **has one** Bracket (1-to-1)
- Bracket **contains** Match (1-to-many)
- Match **has two** Users as players (player1, player2)
- Match **has one** User as winner (nullable)

## GraphQL API

All methods from the class diagram are exposed as GraphQL mutations:
- Tournament methods: `addParticipant`, `startTournament`, `finishTournament`
- Bracket methods: `generateBracket`, query `getMatchesForRound`
- Match methods: `playMatch`
