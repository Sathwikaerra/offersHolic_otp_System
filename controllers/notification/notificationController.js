

import { getUserIdFromToken } from "../../middlewares/auth/authMiddleware.js";
import Notification from "../../models/Notification.js";
import User from "../../models/User.js";
import sendPushNotifications from "../../services/notification/notificationService.js";

export const createNotification = async (req, res) => {
    try {  
        const { recipient, type, message, clarificationMessage } = req.body;
        console.log('recipient:', recipient);
        const notification = new Notification({
            recipient,
            type,
            message,
            clarificationMessage
        });
        const UserData = await User.findById(recipient);

        const pushToken = "ExponentPushToken[-kpofPDMjHlmsVJNQeNU_g]"
        console.log('pushToken:', pushToken);

        
        // Send push notification to recipient
        await(pushToken, message);
        const messageData = {
            body: message,
            data: { type, clarificationMessage }
        }

       await sendPushNotifications([pushToken], messageData);

        await notification.save();
        res.status(201).json({
            message: 'Notification created successfully',
            data: notification
        });
    }
    catch (error) {
        console.error('Error creating notification:', error);
    }
}

export const getAllNotifications = async (req, res) => {    
    try {
        const userId = getUserIdFromToken(req);
        const notifications = await Notification.find({ recipient: userId }).sort({ createdAt: -1 });
        res.status(200).json({
            message: 'Notifications fetched successfully',
            count: notifications.length,
            data: notifications
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


export const markNotificationAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findById(id);
        notification.isRead = true;
        await notification.save();
        res.status(200).json({
            message: 'Notification marked as read successfully',
            data: notification
        });
        
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        await Notification.findByIdAndDelete(id);
        res.status(200).json({
            message: 'Notification deleted successfully'
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}