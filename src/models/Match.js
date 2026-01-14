const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  bracket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bracket',
    required: true
  },
  round: {
    type: Number,
    required: true
  },
  player1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  player2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Match', matchSchema);
