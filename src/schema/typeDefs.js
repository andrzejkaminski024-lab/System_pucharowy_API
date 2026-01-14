const typeDefs = `#graphql
  type User {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    createdAt: String!
  }

  type Tournament {
    id: ID!
    name: String!
    startDate: String
    status: String!
    participants: [User!]!
    bracket: Bracket
    createdAt: String!
  }

  type Bracket {
    id: ID!
    tournament: Tournament!
    matches: [Match!]!
    createdAt: String!
  }

  type Match {
    id: ID!
    bracket: Bracket!
    round: Int!
    player1: User!
    player2: User!
    winner: User
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    # Get current user's matches (requires authentication)
    myMatches: [Match!]!
    
    # Get all tournaments
    tournaments: [Tournament!]!
    
    # Get a specific tournament
    tournament(id: ID!): Tournament
    
    # Get bracket for a tournament
    bracket(tournamentId: ID!): Bracket
    
    # Get matches for a specific round in a bracket
    getMatchesForRound(bracketId: ID!, round: Int!): [Match!]!
    
    # Get current user info (requires authentication)
    me: User
  }

  type Mutation {
    # Authentication
    register(firstName: String!, lastName: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    
    # Tournament management
    createTournament(name: String!, startDate: String): Tournament!
    addParticipant(tournamentId: ID!, userId: ID!): Tournament!
    startTournament(tournamentId: ID!): Tournament!
    finishTournament(tournamentId: ID!): Tournament!
    
    # Bracket management
    generateBracket(tournamentId: ID!): Bracket!
    
    # Match management
    playMatch(matchId: ID!, winnerId: ID!): Match!
  }
`;

module.exports = typeDefs;
