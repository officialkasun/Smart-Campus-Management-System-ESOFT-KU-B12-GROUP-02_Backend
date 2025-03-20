import Schedule from '../models/Schedule.js';
import User from '../models/User.js';

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


// Add Event to Schedule
export const addEventToScheduleByAdmin = async (req, res) => {
    const { studentId, events } = req.body;

    const { title, description, date, location, type } = events;
  
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


// Get all student schedules for admin
export const getStudentScheduleByAdmin = async (req, res) => {
    try {
        const schedules = await Schedule.find().populate('studentId', 'name email');
        if (!schedules || schedules.length === 0) {
            return res.status(404).json({ message: 'No schedules found' });
        }
    
        res.status(200).json(schedules);
    } catch (error) {
        console.error('Error fetching schedules:', error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

// Update event in schedule
export const updateEventInSchedule = async (req, res) => {
    const studentId = req.user._id; 
    const { eventId } = req.params.eventId; 
    const { title, description, date, location, type } = req.body;
  
    try {
      const schedule = await Schedule.findOne({_id: studentId });
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
    const { eventId } = req.params.eventId; 
  
    try {
        const schedule = await Schedule.findOne({ _id: studentId });
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

export const deleteEventFromScheduleCompletely = async (req, res) => {
  
    const { eventId } = req.params; 
    
  
    try {
        const schedule = await Schedule.deleteOne({ _id: eventId });
 
  
        res.status(200).json({message: "The event has been deleted.",schedule});
    } catch (error) {
        console.error('Error deleting event from schedule:', error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};


export const deleteEventFromScheduleByAdmin = async (req, res) => {
  
    const { eventId , studentId } = req.params; 
  
    try {
        const schedule = await Schedule.findOne({ studentId: studentId });
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

// Add event to a student's schedule (admin/lecturer only)
export const addEventToStudentSchedule = async (req, res) => {
  const {  title, description, date, location, type } = req.body;
  const studentId = req.params.stuId;

  try {
    let schedule = await Schedule.findOne({ studentId: studentId });

    if (!schedule) {
      schedule = await Schedule.create({ studentId, events: [] });
    }

    schedule.events.push({ title, description, date, location, type });
    await schedule.save();

    res.status(201).json(schedule);
  } catch (error) {
    console.error('Error adding event to student schedule:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};


// The rest of your getStudentScheduleById 
export const getStudentScheduleById = async (req, res) => {
  const { stuId } = req.params;
  const requestingUser = req.user;

  try {
    if (requestingUser.role !== 'admin' && requestingUser.role !== 'lecturer') {
      return res.status(403).json({ message: 'You are not authorized to access this resource' });
    }

    const student = await User.findById(stuId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const schedule = await Schedule.findOne({ studentId: stuId }).populate('studentId', 'name email');
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found for this student' });
    }

    res.status(200).json(schedule);
  } catch (error) {
    console.error('Error fetching student schedule by ID:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};