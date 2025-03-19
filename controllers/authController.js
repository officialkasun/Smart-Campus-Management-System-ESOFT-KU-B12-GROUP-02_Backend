import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';

// Register a new user
export const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const latestUser = await User.find().sort({_id: -1}).limit(1);
      let id;
      if (latestUser.length == 0) {
        id = 'U-0001';
      } else {
        const currentId = latestUser[0].id;
        let number = currentId.replace('U-','');
        number = (parseInt(number, 10) + 1).toString().padStart(4, "0")
        id = "U-" + number;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ id, name, email, password: hashedPassword, role });

    const token = jwt.sign({_id: user._id, id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Login user
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1]; // Extract the token from the header
      try {
        const decoded = jwt.verify(token, JWT_SECRET); // Verify the token
        if (decoded.id === user.id) {
          return res.status(400).json({ message: 'You are already logged in' });
        }
      } catch (error) {
        // If the token is invalid or expired, proceed with login
      }
    }

    const token = jwt.sign({_id: user._id, id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.status(200).json({ user, token });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};