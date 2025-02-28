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

