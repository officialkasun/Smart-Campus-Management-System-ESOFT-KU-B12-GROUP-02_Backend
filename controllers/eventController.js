import User from '../models/User.js';
import Event from '../models/Event.js';
import Notification from '../models/Notification.js';
import { sendEmail } from '../utils/emailSender.js';
import { getUserActivityAnalyticsData } from '../controllers/userController.js';
import { getIO } from '../utils/socket.js'; 

// Helper function to get event attendance analytics without requiring req/res
export const getEventAnalyticsData = async () => {
  try {
    const totalEvents = await Event.countDocuments();

    const totalAttendees = await Event.aggregate([
      {
        $group: {
          _id: null,
          totalAttendees: { $sum: '$attendeesCount' },
        },
      },
    ]);

    const mostAttendedEvents = await Event.aggregate([
      {
        $sort: { attendeesCount: -1 },
      },
      {
        $limit: 5, 
      },
      {
        $project: {
          title: 1,
          attendeesCount: 1,
        },
      },
    ]);

    return {
      totalEvents,
      totalAttendees: totalAttendees[0]?.totalAttendees || 0,
      mostAttendedEvents,
    };
  } catch (error) {
    console.error('Error fetching event attendance analytics data:', error);
    throw error;
  }
};

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

    // Use the helper function 
    const analytics = await getEventAnalyticsData();
    const io = getIO(); 
    io.emit('eventUpdate', analytics);

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
    const events = await Event.find().populate('organizer', 'name email');
  
    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Get events by title - supports partial name matching
export const getEventByTitle = async (req, res) => {
  try {
    const searchTitle = req.params.eventTitle; 
    console.log('Search Title:', searchTitle); 

    if (!searchTitle || typeof searchTitle !== 'string') {
      return res.status(400).json({ message: 'Invalid search title' });
    }

    const events = await Event.find({
      title: { $regex: searchTitle, $options: 'i' }
    });

    if (events.length === 0) {
      return res.status(404).json({ message: 'No events found matching this title' });
    }

    res.status(200).json(events);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Assign multiple students to an event
export const assignBulkStudentsToEvent = async (req, res) => {
  const { eventId } = req.params;
  const { studentIds } = req.body;

  try {
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ message: 'Provide the student IDs' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const validStudents = await User.find({
      _id: { $in: studentIds },
      role: 'student',
    });

    const validStudentIds = validStudents.map((student) => student._id.toString());

    const newStudents = validStudentIds.filter((id) => !event.attendees.includes(id));

    if (newStudents.length === 0) {
      return res.status(400).json({ message: 'No new students to add' });
    }

    event.attendees.push(...newStudents);
    event.attendeesCount += newStudents.length;
    await event.save();

    for (const studentId of newStudents) {
      const student = validStudents.find((s) => s._id.toString() === studentId);

      if (student) {
        await Notification.create({
          userId: studentId,
          message: `You have been assigned to the event: ${event.title}`,
        });

        const emailSubject = `Event Assignment: ${event.title}`;
        const emailText = `You have been assigned to the event "${event.title}" on ${event.date}.`;
        sendEmail(student.email, emailSubject, emailText);
      }
    }

    const eventAnalytics = await getEventAnalyticsData();
    const userAnalytics = await getUserActivityAnalyticsData();
    const io = getIO();
    io.emit('eventUpdate', eventAnalytics);
    io.emit('userUpdate', userAnalytics);

    res.status(200).json({ message: 'Students assigned successfully', event });
  } catch (error) {
    console.error('Error assigning students to event:', error);
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

    const eventAnalytics = await getEventAnalyticsData();
    const userAnalytics = await getUserActivityAnalyticsData();
    const io = getIO(); 
    io.emit('eventUpdate', eventAnalytics);
    io.emit('userUpdate', userAnalytics);

    res.status(200).json({ message: 'Attendance marked successfully', event });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Delete an attendee from an event
export const deleteAttendee = async (req, res) => {
  const { eventId, attendeeId } = req.params;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (!event.attendees.includes(attendeeId)) {
      return res.status(400).json({ message: 'Attendee not found in this event' });
    }

    event.attendees = event.attendees.filter((id) => id.toString() !== attendeeId);
    event.attendeesCount -= 1;

    await event.save();

    const eventAnalytics = await getEventAnalyticsData();
    const userAnalytics = await getUserActivityAnalyticsData();
    const io = getIO();
    io.emit('eventUpdate', eventAnalytics);
    io.emit('userUpdate', userAnalytics);

    res.status(200).json({ message: 'Attendee removed successfully', event });
  } catch (error) {
    console.error('Error deleting attendee:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Get events with attendance
export const getEventsWithAttendance = async (req, res) => {
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

// Get event attendance analytics (route handler)
export const getEventAttendanceAnalytics = async (req, res) => {
  try {
    const analyticsData = await getEventAnalyticsData();
    res.status(200).json(analyticsData);
  } catch (error) {
    console.error('Error fetching event attendance analytics:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

//Update an event
export const updateEvent = async (req, res) => {
  const eventId = req.params.id;
  const { title, description, date, location, organizer } = req.body;
  const userId = req.user._id;

  try {
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      {
        title,
        description,
        date,
        location,
        organizer,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    ).populate('organizer', 'name email');

    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Notify attendees about the event update
    const attendees = event.attendees;
    if (attendees.length > 0) {
      const users = await User.find({ _id: { $in: attendees } });

      users.forEach(async (user) => {
        await Notification.create({
          userId: user._id,
          message: `The event "${event.title}" has been updated.`,
        });

        const emailSubject = `Event Update: ${event.title}`;
        const emailText = `The event "${event.title}" has been updated.\n\nUpdated details:\nDate: ${updatedEvent.date}\nLocation: ${updatedEvent.location}\nDescription: ${updatedEvent.description}`;
        sendEmail(user.email, emailSubject, emailText);
      });
    }

    res.status(200).json({ message: 'Event updated successfully', event: updatedEvent });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

//Delete an event
export const deleteEvent = async (req, res) => {
  const eventId = req.params.id;

  try {
    const deletedEvent = await Event.deleteOne({ _id: eventId });

    if(deletedEvent.deletedCount === 0){
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({ message: "Event deleted successfully" });

  } catch(error) {
    console.error('Error deleting event', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
}
