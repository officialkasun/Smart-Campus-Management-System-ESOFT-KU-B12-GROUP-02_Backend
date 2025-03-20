import Notification from "../models/Notification.js";

//Get user specific notifications
export const getNotifications = async (req,res) => {
    try {
        const userId = req.user._id; 
    
        const notifications = await Notification.find({ userId }).populate('userId', 'name email'); // Populate user details
    
        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Something went wrong' });
    }
}

// Mark notification as read
export const markNotificationAsRead = async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user._id;
  
  try {
    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    if (!notification.userId.equals(userId)) {
      return res.status(403).json({ message: 'Not authorized to update this notification' });
    }
    
    notification.read = true;
    await notification.save();
    
    res.status(200).json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req, res) => {
    const userId = req.user._id;
    
    try {
      const result = await Notification.updateMany(
        { userId, read: false },
        { read: true }
      );
      
      res.status(200).json({ 
        message: 'All notifications marked as read',
        count: result.modifiedCount
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({ message: 'Something went wrong' });
    }
};

// Get unread notification count
export const getUnreadNotificationCount = async (req, res) => {
    const userId = req.user._id;
    
    try {
      const count = await Notification.countDocuments({ userId, read: false });
      
      res.status(200).json({ unreadCount: count });
    } catch (error) {
      console.error('Error getting unread notification count:', error);
      res.status(500).json({ message: 'Something went wrong' });
    }
};

