const jwt = require('jsonwebtoken');
const User = require('../models/User');

const getUser = async (token) => {
  try {
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      return user;
    }
    return null;
  } catch (error) {
    return null;
  }
};

module.exports = { getUser };
