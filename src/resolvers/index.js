const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Tournament = require('../models/Tournament');
const Match = require('../models/Match');
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
        .populate('tournament')
        .populate('player1')
        .populate('player2')
        .populate('winner')
        .sort({ createdAt: -1 });
      
      return matches;
    },
    
    // Get all tournaments
    tournaments: async () => {
      return await Tournament.find()
        .populate('createdBy')
        .sort({ createdAt: -1 });
    },
    
    // Get a specific tournament
    tournament: async (_, { id }) => {
      return await Tournament.findById(id).populate('createdBy');
    },
    
    // Get all matches for a tournament
    matchesByTournament: async (_, { tournamentId }) => {
      return await Match.find({ tournament: tournamentId })
        .populate('tournament')
        .populate('player1')
        .populate('player2')
        .populate('winner')
        .sort({ createdAt: -1 });
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
  
  Mutation: {
    // Register a new user
    register: async (_, { username, email, password }) => {
      // Check if user already exists
      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        throw new GraphQLError('User with this email or username already exists', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const user = new User({
        username,
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
    createTournament: async (_, { name, description, startDate, endDate }, { user }) => {
      const tournament = new Tournament({
        name,
        description,
        startDate,
        endDate,
        createdBy: user ? user._id : null
      });
      
      await tournament.save();
      return await Tournament.findById(tournament._id).populate('createdBy');
    },
    
    // Update a tournament
    updateTournament: async (_, { id, name, description, startDate, endDate, status }) => {
      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (startDate !== undefined) updateData.startDate = startDate;
      if (endDate !== undefined) updateData.endDate = endDate;
      if (status !== undefined) updateData.status = status;
      
      const tournament = await Tournament.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      ).populate('createdBy');
      
      if (!tournament) {
        throw new GraphQLError('Tournament not found', {
          extensions: { code: 'NOT_FOUND' }
        });
      }
      
      return tournament;
    },
    
    // Delete a tournament
    deleteTournament: async (_, { id }) => {
      // Verify tournament exists first
      const tournament = await Tournament.findById(id);
      if (!tournament) {
        throw new GraphQLError('Tournament not found', {
          extensions: { code: 'NOT_FOUND' }
        });
      }
      
      // Delete all matches for this tournament first
      await Match.deleteMany({ tournament: id });
      
      // Then delete the tournament
      await Tournament.findByIdAndDelete(id);
      
      return true;
    },
    
    // Create a match
    createMatch: async (_, { tournamentId, round, player1Id, player2Id, matchDate }) => {
      // Verify tournament exists
      const tournament = await Tournament.findById(tournamentId);
      if (!tournament) {
        throw new GraphQLError('Tournament not found', {
          extensions: { code: 'NOT_FOUND' }
        });
      }
      
      // Verify players exist
      const player1 = await User.findById(player1Id);
      const player2 = await User.findById(player2Id);
      
      if (!player1 || !player2) {
        throw new GraphQLError('One or both players not found', {
          extensions: { code: 'NOT_FOUND' }
        });
      }
      
      const match = new Match({
        tournament: tournamentId,
        round,
        player1: player1Id,
        player2: player2Id,
        matchDate
      });
      
      await match.save();
      return await Match.findById(match._id)
        .populate('tournament')
        .populate('player1')
        .populate('player2')
        .populate('winner');
    },
    
    // Update a match
    updateMatch: async (_, { id, score1, score2, winnerId, status }) => {
      const updateData = {};
      if (score1 !== undefined) updateData.score1 = score1;
      if (score2 !== undefined) updateData.score2 = score2;
      if (winnerId !== undefined) updateData.winner = winnerId;
      if (status !== undefined) updateData.status = status;
      
      const match = await Match.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      )
        .populate('tournament')
        .populate('player1')
        .populate('player2')
        .populate('winner');
      
      if (!match) {
        throw new GraphQLError('Match not found', {
          extensions: { code: 'NOT_FOUND' }
        });
      }
      
      return match;
    },
    
    // Delete a match
    deleteMatch: async (_, { id }) => {
      const match = await Match.findByIdAndDelete(id);
      if (!match) {
        throw new GraphQLError('Match not found', {
          extensions: { code: 'NOT_FOUND' }
        });
      }
      
      return true;
    }
  }
};

module.exports = resolvers;
