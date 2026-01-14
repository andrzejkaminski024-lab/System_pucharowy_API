# Example GraphQL Queries and Mutations

This file contains example queries and mutations you can use to test the API.

## Setup

1. Start the server: `npm start` or `npm run dev`
2. Make sure MongoDB is running
3. Open GraphQL Playground at `http://localhost:4000`

## Step-by-Step Testing Guide

### 1. Register a User

```graphql
mutation {
  register(
    username: "alice",
    email: "alice@example.com",
    password: "password123"
  ) {
    token
    user {
      id
      username
      email
    }
  }
}
```

**Copy the token from the response!**

### 2. Login (alternative to registration)

```graphql
mutation {
  login(
    email: "alice@example.com",
    password: "password123"
  ) {
    token
    user {
      id
      username
      email
    }
  }
}
```

### 3. Set Authorization Header

In GraphQL Playground, click "HTTP HEADERS" at the bottom and add:
```json
{
  "Authorization": "Bearer YOUR_TOKEN_HERE"
}
```

### 4. Get Current User Info

```graphql
query {
  me {
    id
    username
    email
    createdAt
  }
}
```

### 5. Create a Tournament

```graphql
mutation {
  createTournament(
    name: "Summer Championship 2024",
    description: "Annual summer tournament",
    startDate: "2024-07-01",
    endDate: "2024-07-15"
  ) {
    id
    name
    description
    status
    startDate
    endDate
    createdAt
  }
}
```

**Save the tournament ID from the response!**

### 6. Get All Tournaments

```graphql
query {
  tournaments {
    id
    name
    description
    status
    startDate
    endDate
    createdBy {
      username
    }
  }
}
```

### 7. Register More Users (for creating matches)

```graphql
mutation {
  register(
    username: "bob",
    email: "bob@example.com",
    password: "password123"
  ) {
    token
    user {
      id
      username
    }
  }
}
```

```graphql
mutation {
  register(
    username: "charlie",
    email: "charlie@example.com",
    password: "password123"
  ) {
    token
    user {
      id
      username
    }
  }
}
```

**Save the user IDs!**

### 8. Create a Match

```graphql
mutation {
  createMatch(
    tournamentId: "TOURNAMENT_ID_HERE",
    round: "Quarter Final",
    player1Id: "USER_ID_1",
    player2Id: "USER_ID_2",
    matchDate: "2024-07-05"
  ) {
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
    status
    matchDate
  }
}
```

### 9. Get Matches by Tournament

```graphql
query {
  matchesByTournament(tournamentId: "TOURNAMENT_ID_HERE") {
    id
    round
    player1 {
      username
    }
    player2 {
      username
    }
    score1
    score2
    status
    matchDate
  }
}
```

### 10. Get My Matches (requires authentication)

**Important:** Make sure you're logged in as one of the players!

```graphql
query {
  myMatches {
    id
    tournament {
      name
    }
    round
    player1 {
      username
    }
    player2 {
      username
    }
    score1
    score2
    winner {
      username
    }
    status
    matchDate
  }
}
```

### 11. Update Match (add scores)

```graphql
mutation {
  updateMatch(
    id: "MATCH_ID_HERE",
    score1: 3,
    score2: 1,
    winnerId: "WINNER_USER_ID",
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

### 12. Update Tournament

```graphql
mutation {
  updateTournament(
    id: "TOURNAMENT_ID_HERE",
    status: "ongoing"
  ) {
    id
    name
    status
  }
}
```

### 13. Delete a Match

```graphql
mutation {
  deleteMatch(id: "MATCH_ID_HERE")
}
```

### 14. Delete a Tournament

```graphql
mutation {
  deleteTournament(id: "TOURNAMENT_ID_HERE")
}
```

## Complete Example Workflow

Here's a complete workflow from start to finish:

```graphql
# 1. Register first user
mutation {
  register(username: "player1", email: "player1@test.com", password: "test123") {
    token
    user { id username }
  }
}

# 2. Register second user
mutation {
  register(username: "player2", email: "player2@test.com", password: "test123") {
    token
    user { id username }
  }
}

# 3. Login as first user and set Authorization header with the token
mutation {
  login(email: "player1@test.com", password: "test123") {
    token
    user { id username }
  }
}

# 4. Create a tournament
mutation {
  createTournament(
    name: "Test Tournament",
    description: "Testing tournament system"
  ) {
    id
    name
  }
}

# 5. Create a match (use IDs from steps 1, 2, and 4)
mutation {
  createMatch(
    tournamentId: "...",
    round: "Final",
    player1Id: "...",
    player2Id: "..."
  ) {
    id
    round
    player1 { username }
    player2 { username }
  }
}

# 6. Get my matches (as player1)
query {
  myMatches {
    id
    round
    tournament { name }
    player1 { username }
    player2 { username }
    status
  }
}

# 7. Update match with scores
mutation {
  updateMatch(
    id: "...",
    score1: 2,
    score2: 1,
    winnerId: "...",
    status: "completed"
  ) {
    id
    score1
    score2
    winner { username }
  }
}
```

## Tips

- Always copy and save IDs when creating resources
- Remember to set the Authorization header after login
- Use the `me` query to check if you're authenticated
- The `myMatches` query automatically filters matches where you're a player
- All mutations can be used without authentication, but `myMatches` and `me` queries require it
