import mongoose from 'mongoose';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// Get all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Get all instructors
export const getInstructors = async (req, res) => {
  try {
    const users = await User.find({ role: "lecturer" });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Get all students
export const getStudents = async (req, res) => {
  try {
    const users = await User.find({ role: "student" });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Get a single user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findOne({id: req.params.id});
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Get a single user by Name
export const getUserByName = async (req, res) => {
  try {
    const searchName = req.params.name;
    // Use regex for partial matching with case insensitivity
    const users = await User.find({
      name: { $regex: searchName, $options: 'i' }
    });
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found matching this name' });
    }
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Update user role (admin only)
export const updateUserRole = async (req, res) => {
  try {
    const userId = req.params.id;
    const newRole = req.body.role;

    if (!newRole || !['student', 'lecturer', 'admin'].includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const result = await User.updateOne(
      { id: userId }, 
      { $set: { role: newRole } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (result.modifiedCount === 0) {
      return res.status(200).json({ message: 'Role already the same' });
    }

    res.status(200).json({ message: 'The user role has been updated' });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Update user (admin only)
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  
  // Check for attempting to update password directly - should be done through changePassword
  if (updateData.password) {
    return res.status(400).json({ message: 'Password cannot be updated through this endpoint' });
  }
  
  try {
    // Find the user first to check if they exist
    const userExists = await User.findOne({_id: req.params.id});
    if (!userExists) {
      return res.status(404).json({ message: 'User not founds ' + id  });
    }
    
    // Update the user
    const user = await User.findOneAndUpdate(
      { _id : id },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not foundsss ' + id });
    }

    res.status(200).json({ 
      message: 'User has been successfully updated', 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
        // Add other fields you want to return
      } 
    });
  } catch (error) {
    console.error('Error updating user:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Helper function to get user activity analytics data without requiring req/res
export const getUserActivityAnalyticsData = async () => {
  try {
    const mostActiveUsers = await User.aggregate([
      {
        $lookup: {
          from: 'events',
          localField: '_id',
          foreignField: 'attendees',
          as: 'attendedEvents',
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          attendedEventsCount: { $size: '$attendedEvents' },
        },
      },
      {
        $sort: { attendedEventsCount: -1 },
      },
      {
        $limit: 5,
      },
    ]);

    return {
      mostActiveUsers: mostActiveUsers.length ? mostActiveUsers : [],
    };
  } catch (error) {
    console.error('Error fetching user activity analytics data:', error);
    throw error;
  }
};

// Get user activity analytics (route handler)
export const getUserActivityAnalytics = async (req, res) => {
  try {
    const analyticsData = await getUserActivityAnalyticsData();
    
    if (!analyticsData.mostActiveUsers.length) {
      return res.status(404).json({ message: 'No active users found' });
    }

    res.status(200).json(analyticsData);
  } catch (error) {
    console.error('Error fetching user activity analytics:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Update email functionality
export const changeEmail = async (req, res) => {
  const { newEmail } = req.body;
  const userId = req.user._id; 

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already in use' });
    }

    user.email = newEmail;
    await user.save();

    res.status(200).json({ message: 'Email updated successfully' });
  } catch (error) {
    console.error('Error changing email:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Update password functionality
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user._id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const isPasswordSame = await bcrypt.compare(newPassword, user.password);
    if (isPasswordSame) {
      return res.status(400).json({ message: 'Your new is password is same to the current password' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Delte a user by id 
export const deleteUser = async (req, res) => {
  const userId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const userDeletion = await User.deleteOne({_id: userId});

    if(userDeletion.deletedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });

  } catch (error) {
    console.error('Error deleting user', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
}
