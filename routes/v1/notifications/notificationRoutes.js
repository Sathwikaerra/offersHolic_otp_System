import express from 'express';
import { createNotification, deleteNotification, getAllNotifications, markNotificationAsRead } from '../../../controllers/notification/notificationController.js';
import { authenticateAdmin, authenticateToken } from '../../../middlewares/auth/authMiddleware.js';

const router = express.Router();



// List all categories
router.post("/create",authenticateAdmin, createNotification);
router.get("/all",authenticateToken, getAllNotifications);

// Get a single category by ID
router.put("/mark-read/:id",authenticateToken, markNotificationAsRead);

//Delete Notification
router.delete("/delete/:id",authenticateToken, deleteNotification);


export default router;
