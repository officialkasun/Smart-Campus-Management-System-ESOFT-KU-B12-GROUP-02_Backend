import Course from '../models/Course.js';
import User from '../models/User.js';
import { sendEmail } from '../utils/emailSender.js';

// Get all courses
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate('instructor', 'name email');
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Register for a course
export const registerForCourse = async (req, res) => {
  const { courseId } = req.body;
  const studentId = req.user.id;

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if the student is already registered
    if (course.students.includes(studentId)) {
      return res.status(400).json({ message: 'You are already registered for this course' });
    }

    // Add the student to the course
    course.students.push(studentId);
    await course.save();

    // Add the course to the student's schedule
    const student = await User.findById(studentId);
    student.courses.push(courseId);
    await student.save();

    // Send a notification email
    const emailSubject = `Course Registration Confirmation: ${course.name}`;
    const emailText = `You have successfully registered for ${course.name} (${course.code}).\n\nSchedule: ${course.schedule.day}, ${course.schedule.startTime} - ${course.schedule.endTime}`;
    sendEmail(student.email, emailSubject, emailText);

    res.status(200).json({ message: 'Course registration successful', course });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Get a student's schedule
export const getStudentSchedule = async (req, res) => {
  const studentId = req.user.id;

  try {
    const student = await User.findById(studentId).populate({
      path: 'courses',
      populate: { path: 'instructor', select: 'name email' },
    });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json(student.courses);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};