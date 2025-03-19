import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Course from '../models/Course.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { sendEmail } from '../utils/emailSender.js';

// Create a new course (instructor only) with file upload
export const createCourse = async (req, res) => {
  const { name, code, description, schedule, instructor } = req.body;
  const instructorId = instructor || req.user._id; 

  console.log('Request received for creating course:', { name, code, instructor });
  
  try {
    const existingCourse = await Course.findOne({ code });
    if (existingCourse) {
      return res.status(400).json({ message: 'Course with this code already exists' });
    }

    // Handle file upload
    const lectureMaterials = req.files?.map((file) => file.path); // Save file paths

    // Create the course
    const course = await Course.create({
      name,
      code,
      description,
      schedule,
      instructor: instructorId,
      lectureMaterials, 
    });

    const users = await User.find();
    users.forEach(async (user) => {
      await Notification.create({
        userId: user._id,
        message: `New course: ${course.name} (${course.code}) has been created. Check it out now!`,
      });
    });

    res.status(201).json({ message: "A new Course has been created",course});
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Get all courses
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate('instructor', 'name email');
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Get all courses for specific lecturer (Logged in user)
export const getLecturerCourses = async (req, res) => {
  const lecturerId = req.user._id;

  try {
    const courses = await Course.find({ instructor: lecturerId }).populate('instructor', 'name email');
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Register for a course
export const registerForCourse = async (req, res) => {
  const courseId = req.params.courseId;
  const studentId = req.user._id;

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.students.includes(studentId)) {
      return res.status(400).json({ message: 'You are already registered for this course' });
    }

    course.students.push(studentId);
    await course.save();

    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    student.courses.push(courseId);
    await student.save();

    // Send a notification email
    const emailSubject = `Course Registration Confirmation: ${course.name}`;
    const emailText = `You have successfully registered for ${course.name} (${course.code}).\n\nSchedule: ${course.schedule.day}, ${course.schedule.startTime} - ${course.schedule.endTime}`;
    sendEmail(student.email, emailSubject, emailText);

    res.status(200).json({ message: 'Course registration successful', course });
  } catch (error) {
    console.error('Error in registerForCourse:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Get a student's schedule
export const getStudentSchedule = async (req, res) => {
  const studentId = req.user._id;

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

// Get course by courseId
export const getCourseById = async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user._id; 

  try {
    const course = await Course.findOne({ code: courseId })
      .populate('instructor', 'name email') 
      .populate('students', 'name email'); 

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if the user is the instructor or a student enrolled in the course / an admin
    const isInstructor = course.instructor._id.equals(userId);
    const isStudent = course.students.some((student) => student._id.equals(userId));

    if (!isInstructor && !isStudent && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to view this course'  });
    }

    res.status(200).json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Get course by courseName - supports partial name matching
export const getCourseByName = async (req, res) => {

  
  
  try {
    const searchName = req.params.courseName;
    // Use regex for partial matching with case insensitivity
    const users = await Course.find({
      name: { $regex: searchName, $options: 'i' }
    });
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'No courses found matching this name' });
    }
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong'});
  }
};

//Get Lecture materials
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all lecture materials for a course
export const getLectureMaterials = async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user._id;

  try {
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const isInstructor = course.instructor.equals(userId);
    const isStudent = course.students.includes(userId);

    if (!isInstructor && !isStudent) {
      return res.status(403).json({ message: 'You are not authorized to view these files' });
    }
    
    const lectureMaterials = course.lectureMaterials;

    if (!lectureMaterials || lectureMaterials.length === 0) {
      return res.status(404).json({ message: 'No lecture materials found for this course' });
    }

    // Optionally, you can return additional metadata about the files
    const materialsWithMetadata = lectureMaterials.map((filePath) => {
      const fullPath = path.join(__dirname, '..', filePath);
      const stats = fs.statSync(fullPath);

      return {
        filename: path.basename(filePath),
        filePath,
        size: stats.size,
        createdAt: stats.birthtime,
      };
    });

    res.status(200).json(materialsWithMetadata);
  } catch (error) {
    console.error('Error fetching lecture materials:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Update an existing course
export const updateCourse = async (req, res) => {
  const courseId = req.params.id;
  const { name, code, description, schedule, instructor } = req.body;
  const userId = req.user._id;

  console.log('Request received for updating course:', { name, code, instructor });
  
  try {
    // Find the course to update
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is the instructor of the course or an admin
    if (!course.instructor.equals(userId) && req.user.role !== 'admin' && req.user.role !== 'lecturer') {
      return res.status(403).json({ message: 'You are not authorized to update this course' });
    }

    console.log(req.files);
    
    // Handle lecture materials properly using let instead of const
    let lectureMaterials = req.body.lectureMaterials || course.lectureMaterials || [];
    
    // Handle new lecture materials if uploaded
    if (req.files && req.files.length > 0) {
      // Add the new lecture materials to the existing ones
      const newMaterials = req.files.map(file => file.path);
      lectureMaterials = [...lectureMaterials, ...newMaterials];
    }

    // Update the course
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        name,
        code,
        description,
        schedule,
        instructor,
        lectureMaterials
      },
      { new: true, runValidators: true }
    ).populate('instructor', 'name email');

    if (!updatedCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Notify enrolled students about the course update
    const enrolledStudents = course.students;
    if (enrolledStudents.length > 0) {
      const students = await User.find({ _id: { $in: enrolledStudents } });
      
      students.forEach(async (student) => {
        await Notification.create({
          userId: student._id,
          message: `The course ${course.name} (${course.code}) has been updated.`,
        });
        
        // Optionally send email notification
        const emailSubject = `Course Update: ${course.name}`;
        const emailText = `The course ${course.name} (${course.code}) has been updated.\n\nUpdated schedule: ${updatedCourse.schedule.day}, ${updatedCourse.schedule.startTime} - ${updatedCourse.schedule.endTime}`;
        sendEmail(student.email, emailSubject, emailText);
      });
    }

    res.status(200).json({ message: 'Course updated successfully', course: updatedCourse });
  } catch (error) {
    console.error('Error updating course:', error);
    
    // If there was an error and new files were uploaded, clean them up
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) console.error('Error cleaning up uploaded file:', err);
        });
      });
    }
    
    res.status(500).json({ message: 'Something went wrong while updating the course' });
  }
};

//Delete a course
export const deleteCourse = async (req, res) => {
  const courseId = req.params.id;

  try {
    const deletedCourse = await Course.deleteOne({ _id: courseId });

    if(deletedCourse.deletedCount === 0){
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json({ message: "Course deleted successfully" });

  } catch(error) {
    console.error('Error deleting course', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

