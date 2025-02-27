import User from '../models/User.js';
import Event from '../models/Event.js';
import Notification from '../models/Notification.js';

// Create a new event
export const createEvent = async (req, res) => {
  const { title, description, date, location } = req.body;

  try {
    const event = await Event.create({
      title,
      description,
      date,
      location,
      organizer: req.user.id,
    });

    const users = await User.find();
    users.forEach(async (user)=>{
      await Notification.create({
        userId: user.id,
        message: `New event: ${title} on ${date}`,
      });
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Get all events
export const getEvents = async (req, res) => {
  try {
    const events = await Event.find().populate('organizer', 'name email');
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};