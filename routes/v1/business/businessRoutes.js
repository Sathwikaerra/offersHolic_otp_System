import express from 'express';
import { createBusinessProfile, deleteBusinessProfile, editBusinessProfile, getAllBusinessProfile, getAllBusinessProfileByUserId, getAllCurrentUserBusinessProfile, getBusinessProfileById, incrementFollowersCount, toggleBusinessProfileActivation } from '../../../controllers/business/businessProfileController.js';
import { authenticateToken } from '../../../middlewares/auth/authMiddleware.js';


import BusinessProfile from '../../../models/BusinessProfile.js';
import Notification from '../../../models/Notification.js';

 
const router = express.Router();


// ✅ Approve Business Profile
router.patch('/approve/:id', async (req, res) => {
  try {
    const profile = await BusinessProfile.findById(req.params.id).populate('User');
    if (!profile) return res.status(404).json({ message: 'Business profile not found' });

    profile.status = 'active';
    await profile.save();

    // Create notification for the user
    await Notification.create({
      recipient: profile.User._id,
      type: 'WelcomeEmail',
      message: `Your business profile "${profile.name}" has been approved.`,
    });

    res.status(200).json({ message: 'Business profile approved', profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Reject Business Profile
router.patch('/reject/:id', async (req, res) => {
  try {
    const profile = await BusinessProfile.findById(req.params.id).populate('User');
    if (!profile) return res.status(404).json({ message: 'Business profile not found' });

    profile.status = 'rejected';
    await profile.save();

    // Create notification for the user
    await Notification.create({
      recipient: profile.User._id,
      type: 'Clarification',
      clarificationMessage: req.body.reason || 'Your business profile was rejected.',
      message: `Your business profile "${profile.name}" has been rejected.`,
    });

    res.status(200).json({ message: 'Business profile rejected', profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});




// Route to create a new Business Profile
router.post('/create', authenticateToken, createBusinessProfile);

// Get BusinessProfile by ID and populate related fields
router.get('/:id', getBusinessProfileById);

//Get All User BusinessProfile with user ID
router.get('/get/all/:userId', getAllBusinessProfileByUserId);

//Get All User BusinessProfile with current user ID
router.get('/get/current', getAllCurrentUserBusinessProfile);

// Get All BusinessProfile   and populate related fields
router.get('/get/all', getAllBusinessProfile);

// Route to edit a Business Profile by ID
router.put('/:id', editBusinessProfile);

// Route to delete a Business Profile by ID
router.delete('/:id', deleteBusinessProfile);

// Route to toggle activation status of a Business Profile by ID
router.put('/toggle/:id', toggleBusinessProfileActivation);

//Route to increment followers count
router.put('/increment/followers/:id', incrementFollowersCount);

// router.put('/ad/status/individual/:adId', changeAdStatusForIndividual);

export default router;
