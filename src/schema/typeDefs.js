const typeDefs = `#graphql
  type User {
    id: ID!
    username: String!
    email: String!
    createdAt: String!
  }

  type Tournament {
    id: ID!
    name: String!
    description: String
    startDate: String
    endDate: String
    status: String!
    createdBy: User
    createdAt: String!
  }

  type Match {
    id: ID!
    tournament: Tournament!
    round: String!
    player1: User!
    player2: User!
    score1: Int
    score2: Int
    winner: User
    status: String!
    matchDate: String
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
    
    # Get all matches for a tournament
    matchesByTournament(tournamentId: ID!): [Match!]!
    
    # Get current user info (requires authentication)
    me: User
  }

  type Mutation {
    # Authentication
    register(username: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    
    # Tournament management
    createTournament(name: String!, description: String, startDate: String, endDate: String): Tournament!
    updateTournament(id: ID!, name: String, description: String, startDate: String, endDate: String, status: String): Tournament!
    deleteTournament(id: ID!): Boolean!
    
    # Match management
    createMatch(tournamentId: ID!, round: String!, player1Id: ID!, player2Id: ID!, matchDate: String): Match!
    updateMatch(id: ID!, score1: Int, score2: Int, winnerId: ID, status: String): Match!
    deleteMatch(id: ID!): Boolean!
  }
`;

module.exports = typeDefs;
