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

// Update user role (admin only)
export const updateUserRole = async (req, res) => {
  try {
    const user = await User.updateOne(
      { id: req.params.id },
      { $set: { role: req.body.role } }
    );

    if (user.modifiedCount === 0) {
      return res.status(404).json({ message: 'Role already the same' });
    }

    res.status(200).json({ message: 'The user role has been updated', user });
  } catch (error) {
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
