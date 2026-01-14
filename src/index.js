const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const typeDefs = require('./schema/typeDefs');
const resolvers = require('./resolvers');
const { getUser } = require('./middleware/auth');

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Start server
const startServer = async () => {
  await connectDB();
  
  const { url } = await startStandaloneServer(server, {
    listen: { port: process.env.PORT || 4000 },
    context: async ({ req }) => {
      // Get token from header
      const token = req.headers.authorization || '';
      const tokenValue = token.replace('Bearer ', '');
      
      // Get user from token
      const user = await getUser(tokenValue);
      
      return { user };
    },
  });
  
  console.log(`🚀 Server ready at: ${url}`);
  console.log(`📊 GraphQL endpoint: ${url}`);
};

startServer().catch((error) => {
  console.error('Error starting server:', error);
  process.exit(1);
});
