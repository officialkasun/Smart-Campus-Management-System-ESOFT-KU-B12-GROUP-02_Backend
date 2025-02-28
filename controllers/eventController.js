import User from '../models/User.js';
import Event from '../models/Event.js';
import Notification from '../models/Notification.js';
import { sendEmail } from '../utils/emailSender.js';

// Create a new event
export const createEvent = async (req, res) => {
  const { title, description, date, location } = req.body;
  const organizerId = req.user._id; 

  console.log('Authenticated User:', req.user);

  try {
    const event = await Event.create({
      title,
      description,
      date,
      location,
      organizer: organizerId,
    });

    const users = await User.find();
    users.forEach(async (user) => {
      await Notification.create({
        userId: user._id,
        message: `New event: ${title} on ${date}`,
      });
    });

    const emailSubject = `New Event: ${title}`;
    const emailText = `A new event has been created:\n\nTitle: ${title}\nDescription: ${description}\nDate: ${date}\nLocation: ${location}\nThis is auto generated email. Please do not reply.`;

    users.forEach((user) => {
      sendEmail(user.email, emailSubject, emailText);
    });

    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Get all events
export const getEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('organizer', 'name email') 
      .populate('attendees', 'name email');

    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Mark attendance for an event
export const markAttendance = async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user._id;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.attendees.includes(userId)) {
      return res.status(400).json({ message: 'You are already attending this event' });
    }

    event.attendees.push(userId); 
    event.attendeesCount += 1;

    await event.save();

    res.status(200).json({ message: 'Attendance marked successfully', event });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

//Get events with attendance
export const getEventsWithAttendance = async (req, res) => {
  try {
    const events = await Event.find().populate('attendees', 'name email');

    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};