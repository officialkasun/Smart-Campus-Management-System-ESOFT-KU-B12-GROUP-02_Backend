import Notification from "../models/Notification.js";

export const getNotifications = async (req,res) => {
    try {
        const notifications = await Notification.find({ userId: req.user.id });
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
}

