const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Tournament = require('../models/Tournament');
const Match = require('../models/Match');
const Bracket = require('../models/Bracket');
const { generateToken } = require('../utils/jwt');
const { GraphQLError } = require('graphql');

const resolvers = {
  Query: {
    // Get current user's matches (requires authentication)
    myMatches: async (_, __, { user }) => {
      if (!user) {
        throw new GraphQLError('You must be logged in to view your matches', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }
      
      const matches = await Match.find({
        $or: [
          { player1: user._id },
          { player2: user._id }
        ]
      })
        .populate('bracket')
        .populate('player1')
        .populate('player2')
        .populate('winner')
        .sort({ round: 1, createdAt: 1 });
      
      return matches;
    },
    
    // Get all tournaments
    tournaments: async () => {
      return await Tournament.find()
        .populate('participants')
        .sort({ createdAt: -1 });
    },
    
    // Get a specific tournament
    tournament: async (_, { id }) => {
      return await Tournament.findById(id).populate('participants');
    },
    
    // Get bracket for a tournament
    bracket: async (_, { tournamentId }) => {
      const bracket = await Bracket.findOne({ tournament: tournamentId })
        .populate('tournament')
        .populate({
          path: 'matches',
          populate: [
            { path: 'player1' },
            { path: 'player2' },
            { path: 'winner' }
          ]
        });
      
      if (!bracket) {
        throw new GraphQLError('Bracket not found for this tournament', {
          extensions: { code: 'NOT_FOUND' }
        });
      }
      
      return bracket;
    },
    
    // Get matches for a specific round
    getMatchesForRound: async (_, { bracketId, round }) => {
      const bracket = await Bracket.findById(bracketId);
      if (!bracket) {
        throw new GraphQLError('Bracket not found', {
          extensions: { code: 'NOT_FOUND' }
        });
      }
      
      return await Match.find({
        bracket: bracketId,
        round: round
      })
        .populate('bracket')
        .populate('player1')
        .populate('player2')
        .populate('winner')
        .sort({ createdAt: 1 });
    },
    
    // Get current user info
    me: async (_, __, { user }) => {
      if (!user) {
        throw new GraphQLError('You must be logged in', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }
      return user;
    }
  },
  
  // Field resolvers
  Tournament: {
    bracket: async (parent) => {
      return await Bracket.findOne({ tournament: parent._id })
        .populate({
          path: 'matches',
          populate: [
            { path: 'player1' },
            { path: 'player2' },
            { path: 'winner' }
          ]
        });
    }
  },
  
  Mutation: {
    // Register a new user
    register: async (_, { firstName, lastName, email, password }) => {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new GraphQLError('User with this email already exists', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const user = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword
      });
      
      await user.save();
      
      // Generate token
      const token = generateToken(user._id);
      
      return {
        token,
        user
      };
    },
    
    // Login
    login: async (_, { email, password }) => {
      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        throw new GraphQLError('Invalid credentials', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }
      
      // Check password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        throw new GraphQLError('Invalid credentials', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }
      
      // Generate token
      const token = generateToken(user._id);
      
      return {
        token,
        user
      };
    },
    
    // Create a tournament
    createTournament: async (_, { name, startDate }) => {
      const tournament = new Tournament({
        name,
        startDate,
        participants: []
      });
      
      await tournament.save();
      return await Tournament.findById(tournament._id).populate('participants');
    },
    
    // Add participant to tournament
    addParticipant: async (_, { tournamentId, userId }) => {
      const tournament = await Tournament.findById(tournamentId);
      if (!tournament) {
        throw new GraphQLError('Tournament not found', {
          extensions: { code: 'NOT_FOUND' }
        });
      }
      
      // Check if tournament has started
      if (tournament.status !== 'upcoming') {
        throw new GraphQLError('Cannot add participants to a tournament that has already started', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }
      
      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND' }
        });
      }
      
      // Check if user is already a participant
      if (tournament.participants.includes(userId)) {
        throw new GraphQLError('User is already a participant', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }
      
      tournament.participants.push(userId);
      await tournament.save();
      
      return await Tournament.findById(tournamentId).populate('participants');
    },
    
    // Start tournament
    startTournament: async (_, { tournamentId }) => {
      const tournament = await Tournament.findById(tournamentId);
      if (!tournament) {
        throw new GraphQLError('Tournament not found', {
          extensions: { code: 'NOT_FOUND' }
        });
      }
      
      if (tournament.status !== 'upcoming') {
        throw new GraphQLError('Tournament has already started or finished', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }
      
      tournament.status = 'ongoing';
      await tournament.save();
      
      return await Tournament.findById(tournamentId).populate('participants');
    },
    
    // Finish tournament
    finishTournament: async (_, { tournamentId }) => {
      const tournament = await Tournament.findById(tournamentId);
      if (!tournament) {
        throw new GraphQLError('Tournament not found', {
          extensions: { code: 'NOT_FOUND' }
        });
      }
      
      if (tournament.status === 'completed') {
        throw new GraphQLError('Tournament is already finished', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }
      
      tournament.status = 'completed';
      await tournament.save();
      
      return await Tournament.findById(tournamentId).populate('participants');
    },
    
    // Generate bracket for tournament
    generateBracket: async (_, { tournamentId }) => {
      const tournament = await Tournament.findById(tournamentId).populate('participants');
      if (!tournament) {
        throw new GraphQLError('Tournament not found', {
          extensions: { code: 'NOT_FOUND' }
        });
      }
      
      // Check if bracket already exists
      const existingBracket = await Bracket.findOne({ tournament: tournamentId });
      if (existingBracket) {
        throw new GraphQLError('Bracket already exists for this tournament', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }
      
      const participants = tournament.participants;
      
      if (participants.length < 2) {
        throw new GraphQLError('Tournament must have at least 2 participants', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }
      
      // Check if number of participants is a power of 2
      const isPowerOf2 = (n) => n > 0 && (n & (n - 1)) === 0;
      if (!isPowerOf2(participants.length)) {
        throw new GraphQLError('Number of participants must be a power of 2', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }
      
      // Create bracket
      const bracket = new Bracket({
        tournament: tournamentId,
        matches: []
      });
      await bracket.save();
      
      // Generate first round matches
      const matches = [];
      for (let i = 0; i < participants.length; i += 2) {
        const match = new Match({
          bracket: bracket._id,
          round: 1,
          player1: participants[i]._id,
          player2: participants[i + 1]._id
        });
        await match.save();
        matches.push(match._id);
      }
      
      bracket.matches = matches;
      await bracket.save();
      
      return await Bracket.findById(bracket._id)
        .populate('tournament')
        .populate({
          path: 'matches',
          populate: [
            { path: 'player1' },
            { path: 'player2' },
            { path: 'winner' }
          ]
        });
    },
    
    // Play a match (set winner)
    playMatch: async (_, { matchId, winnerId }) => {
      const match = await Match.findById(matchId)
        .populate('bracket')
        .populate('player1')
        .populate('player2');
        
      if (!match) {
        throw new GraphQLError('Match not found', {
          extensions: { code: 'NOT_FOUND' }
        });
      }
      
      // Verify winner is one of the players
      if (winnerId !== match.player1._id.toString() && winnerId !== match.player2._id.toString()) {
        throw new GraphQLError('Winner must be one of the match players', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }
      
      // Check if match already has a winner
      if (match.winner) {
        throw new GraphQLError('Match already has a winner', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }
      
      match.winner = winnerId;
      await match.save();
      
      // Check if we need to create next round match
      const bracket = await Bracket.findById(match.bracket._id).populate('matches');
      const currentRoundMatches = await Match.find({
        bracket: bracket._id,
        round: match.round
      });
      
      // Check if all matches in current round are completed
      const allCompleted = currentRoundMatches.every(m => m.winner != null);
      
      if (allCompleted && currentRoundMatches.length > 1) {
        // Create next round matches
        const winners = currentRoundMatches.map(m => m.winner);
        const nextRound = match.round + 1;
        const newMatches = [];
        
        for (let i = 0; i < winners.length; i += 2) {
          if (i + 1 < winners.length) {
            const nextMatch = new Match({
              bracket: bracket._id,
              round: nextRound,
              player1: winners[i],
              player2: winners[i + 1]
            });
            await nextMatch.save();
            newMatches.push(nextMatch._id);
          }
        }
        
        // Add new matches to bracket
        bracket.matches = [...bracket.matches, ...newMatches];
        await bracket.save();
      }
      
      return await Match.findById(matchId)
        .populate('bracket')
        .populate('player1')
        .populate('player2')
        .populate('winner');
    }
  }
};

module.exports = resolvers;
