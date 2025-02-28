import User from '../models/User.js';
import Event from '../models/Event.js';
import Notification from '../models/Notification.js';
import { sendEmail } from '../utils/emailSender.js';

// Create a new event
export const createEvent = async (req, res) => {
  const { title, description, date, location } = req.body;
  const organizerId = req.user.id;

  try {
    const event = await Event.create({
      title,
      description,
      date,
      location,
      organizer: organizerId,
    });

    const users_n = await User.find();
    users_n.forEach(async (user)=>{
      await Notification.create({
        userId: user.id,
        message: `New event: ${title} on ${date}`,
      });
    });

    const users_m = await User.find({}, 'email');
    const emailSubject = `New Event: ${title}`;
    const emailText = `A new event has been created:\n\nTitle: ${title}\nDescription: ${description}\nDate: ${date}\nLocation: ${location}\nThis is auto generated email. Please do not reply.`;

    users_m.forEach((user) => {
      sendEmail(user.email, emailSubject, emailText);
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Get all events
export const getEvents = async (req, res) => {
  try {
    const events = await Event.find();
    const populatedEvents = await Promise.all(
      events.map(async (event) => {
        const organizer = await User.findOne({ id: event.organizer }).select('id name email');
        const attendees = await User.find({ id: { $in: event.attendees } }).select('id name email');

        return {
          ...event.toObject(),
          organizer,
          attendees,
        };
      })
    );

    res.status(200).json(populatedEvents);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Mark attendance for an event
export const markAttendance = async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user.id;
  try {
    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.attendees.includes(userId)) {
      return res.status(400).json({ message: 'You are already attending this event' });
    }

    // Add the user to the attendees list
    event.attendees.push(userId);
    event.attendeesCount += 1;

    // Save the updated event
    await event.save();

    res.status(200).json({ message: 'Attendance marked successfully', event });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};