import Schedule from '../models/Schedule.js';

// Add Event to Schedule
export const addEventToSchedule = async (req, res) => {
    const studentId = req.user._id;
    const { title, description, date, location, type } = req.body;
  
    try {
        let schedule = await Schedule.findOne({ studentId });
    
        if (!schedule) {
            schedule = await Schedule.create({ studentId, events: [] });
        }
    
        schedule.events.push({ title, description, date, location, type });
        await schedule.save();
  
      res.status(201).json(schedule);
    } catch (error) {
        console.error('Error adding event to schedule:', error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

// Get student schedule
export const getStudentSchedule = async (req, res) => {
    const studentId = req.user._id;
  
    try {
        const schedule = await Schedule.findOne({ studentId }).populate('studentId', 'name email');
        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }
    
        res.status(200).json(schedule);
    } catch (error) {
        console.error('Error fetching schedule:', error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

// Update event in schedule
export const updateEventInSchedule = async (req, res) => {
    const studentId = req.user._id; 
    const { eventId } = req.params; 
    const { title, description, date, location, type } = req.body;
  
    try {
      const schedule = await Schedule.findOne({ studentId });
      if (!schedule) {
        return res.status(404).json({ message: 'Schedule not found' });
      }
  
      const event = schedule.events.id(eventId);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
  
      if (title !== undefined) event.title = title;
      if (description !== undefined) event.description = description;
      if (date !== undefined) event.date = date;
      if (location !== undefined) event.location = location;
      if (type !== undefined) event.type = type;
  
      await schedule.save();
  
      res.status(200).json({ message: "Your schedule has been updated.",schedule});
    } catch (error) {
      console.error('Error updating event in schedule:', error);
      res.status(500).json({ message: 'Something went wrong' });
    }
};

export const deleteEventFromSchedule = async (req, res) => {
    const studentId = req.user._id; 
    const { eventId } = req.params; 
  
    try {
        const schedule = await Schedule.findOne({ studentId });
        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }
    
        schedule.events.pull(eventId);
        await schedule.save();
  
        res.status(200).json({message: "The event has been deleted.",schedule});
    } catch (error) {
        console.error('Error deleting event from schedule:', error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};
