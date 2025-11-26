import jwt from 'jsonwebtoken';
import User from '../../models/User.js';

export const getUserIdFromToken = (req) => {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
      throw new Error("Unauthorized");
    }
    const token = authorizationHeader.split("Bearer ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    return decodedToken.id;
  };

  // helper function to get push token from used id
export const getPushToken = async (userId) => {
    const user = await User.findById(userId);
    return user.deviceToken;
  }

  export const getPushTokens = async (userIds) => {
    const users = await User.find({ _id: { $in: userIds } });
    return users.map(user => user.deviceToken);
  }

  export const getPushTokenByToken = async (user) => {
    const authHeader = user.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("Unauthorized");
    }
    const token = authHeader.split("Bearer ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.id;
    const userData = await User.findById(userId);
    return userData.deviceToken;
  }