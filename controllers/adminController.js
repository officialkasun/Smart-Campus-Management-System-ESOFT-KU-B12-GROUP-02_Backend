import User from '../models/User.js';
import Event from '../models/Event.js';
import Resource from '../models/Resource.js';

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Get all events (admin only)
export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().populate('organizer', 'name email');
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Get all resources (admin only)
export const getAllResources = async (req, res) => {
  try {
    const resources = await Resource.find().populate('reservedBy', 'name email');
    res.status(200).json(resources);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};
