# System Pucharowy API (Tournament Management API)

GraphQL API for managing knockout/cup tournaments with JWT authentication.

## Features

- 🔐 User authentication (registration and login) with JWT
- 🏆 Tournament management (create, read, update, delete)
- ⚽ Match management (create, read, update, delete)
- 👤 User-specific match queries (get your matches without providing user ID)
- 📊 GraphQL API with mutations for all operations

## Tech Stack

- Node.js
- Apollo Server (GraphQL)
- MongoDB (Mongoose)
- JWT (JSON Web Tokens)
- bcryptjs (Password hashing)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/andrzejkaminski024-lab/System_pucharowy_API.git
cd System_pucharowy_API
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory (use `.env.example` as template):
```
MONGODB_URI=mongodb://localhost:27017/tournament_db
JWT_SECRET=your_jwt_secret_key_here
PORT=4000
```

4. Start MongoDB (make sure MongoDB is running on your system)

5. Run the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start at `http://localhost:4000`

## API Documentation

### Authentication

#### Register
```graphql
mutation {
  register(username: "john_doe", email: "john@example.com", password: "password123") {
    token
    user {
      id
      username
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
      username
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

#### Get Current User's Matches (requires authentication)
```graphql
query {
  myMatches {
    id
    round
    player1 {
      id
      username
    }
    player2 {
      id
      username
    }
    score1
    score2
    status
    matchDate
  }
}
```

#### Get All Tournaments
```graphql
query {
  tournaments {
    id
    name
    description
    status
    startDate
    endDate
  }
}
```

#### Get Specific Tournament
```graphql
query {
  tournament(id: "TOURNAMENT_ID") {
    id
    name
    description
    status
  }
}
```

#### Get Matches by Tournament
```graphql
query {
  matchesByTournament(tournamentId: "TOURNAMENT_ID") {
    id
    round
    player1 {
      username
    }
    player2 {
      username
    }
    status
  }
}
```

#### Get Current User Info (requires authentication)
```graphql
query {
  me {
    id
    username
    email
  }
}
```

### Mutations

#### Create Tournament
```graphql
mutation {
  createTournament(
    name: "Summer Championship 2024"
    description: "Annual summer tournament"
    startDate: "2024-07-01"
    endDate: "2024-07-15"
  ) {
    id
    name
    status
  }
}
```

#### Update Tournament
```graphql
mutation {
  updateTournament(
    id: "TOURNAMENT_ID"
    name: "Updated Tournament Name"
    status: "ongoing"
  ) {
    id
    name
    status
  }
}
```

#### Delete Tournament
```graphql
mutation {
  deleteTournament(id: "TOURNAMENT_ID")
}
```

#### Create Match
```graphql
mutation {
  createMatch(
    tournamentId: "TOURNAMENT_ID"
    round: "Quarter Final"
    player1Id: "USER_ID_1"
    player2Id: "USER_ID_2"
    matchDate: "2024-07-05"
  ) {
    id
    round
    player1 {
      username
    }
    player2 {
      username
    }
    status
  }
}
```

#### Update Match
```graphql
mutation {
  updateMatch(
    id: "MATCH_ID"
    score1: 3
    score2: 1
    winnerId: "USER_ID_1"
    status: "completed"
  ) {
    id
    score1
    score2
    winner {
      username
    }
    status
  }
}
```

#### Delete Match
```graphql
mutation {
  deleteMatch(id: "MATCH_ID")
}
```

## Data Models

### User
- `id`: Unique identifier
- `username`: User's username (unique)
- `email`: User's email (unique)
- `password`: Hashed password
- `createdAt`: Account creation timestamp

### Tournament
- `id`: Unique identifier
- `name`: Tournament name
- `description`: Tournament description
- `startDate`: Start date
- `endDate`: End date
- `status`: Tournament status (upcoming, ongoing, completed)
- `createdBy`: User who created the tournament
- `createdAt`: Creation timestamp

### Match
- `id`: Unique identifier
- `tournament`: Reference to tournament
- `round`: Match round (e.g., "Quarter Final", "Semi Final", "Final")
- `player1`: First player
- `player2`: Second player
- `score1`: Score of first player
- `score2`: Score of second player
- `winner`: Winner of the match
- `status`: Match status (scheduled, ongoing, completed)
- `matchDate`: Date of the match
- `createdAt`: Creation timestamp

## Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- Token expiration (7 days)
- Protected routes for user-specific data

## Testing with GraphQL Playground

When the server is running, visit `http://localhost:4000` to access the Apollo Server GraphQL Playground.

To test authenticated queries/mutations:
1. First, register or login to get a token
2. Add the token to HTTP headers:
```json
{
  "Authorization": "Bearer YOUR_TOKEN_HERE"
}
```
3. Execute your queries/mutations

## License

ISC