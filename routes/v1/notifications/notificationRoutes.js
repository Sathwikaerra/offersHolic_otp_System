import express from 'express';
import User from '../../../models/User.js'
import { createNotification, deleteNotification, getAllNotifications, markNotificationAsRead } from '../../../controllers/notification/notificationController.js';
import { authenticateAdmin, authenticateToken } from '../../../middlewares/auth/authMiddleware.js';
import  {sendPushNotification}  from "../../../utils/sendNotification.js";

const router = express.Router();

router.post("/broadcast", async (req, res) => {
  try {
    const { title, body, data } = req.body;

    const users = await User.find({ deviceToken: { $exists: true } });

    for (const u of users) {
      await sendPushNotification(u.deviceToken, title, body, data);
    }

    res.status(200).json({ message: "Broadcast sent!" });
  } catch (error) {
    console.error("Broadcast Notification Error:", error);
    res.status(500).json({ message: "Failed to broadcast" });
  }
});




// List all categories
router.post("/create",authenticateAdmin, createNotification);
router.get("/all",authenticateToken, getAllNotifications);

// Get a single category by ID
router.put("/mark-read/:id",authenticateToken, markNotificationAsRead);

//Delete Notification
router.delete("/delete/:id",authenticateToken, deleteNotification);


export default router;
