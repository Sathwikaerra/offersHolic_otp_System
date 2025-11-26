import express from 'express';
import {
  getUserFromToken,
  getAllUsers,

  getUserById,
  deleteUser,
  updateUserData,
  updateUserDataByAdmin,
  savePushToken,

} from '../../../controllers/user/userController.js';
import { authenticateAdmin, authenticateToken } from '../../../middlewares/auth/authMiddleware.js';
import { createAddress, deleteAddressById, getAddressById, getAllAddress, getCurrentUserAddresses, getSavedOffers, updateAddressById } from '../../../controllers/address/addressController.js';
// import addressRoute from '../address/addressRoutes.js';
import User from '../../../models/User.js';

const router = express.Router();





// POST /user/v1/start-free-trial
router.post("/start-free-trial", authenticateToken, async (req, res) => {
  try {
    console.log("entered free trail")
    console.log(req.user)
    const user = await User.findById(req.user.id);

   

    if (!user) return res.status(404).json({ message: "User not found" });
     console.log("user found")

    if (user.freeTrial.status === "active") {
      return res.status(400).json({ message: "Free trial already active" });
    }

    // Activate free trial
    user.freeTrial.status = "active";
    user.freeTrial.startDate = new Date();
    user.freeTrial.expiryDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 30 days
    await user.save();

    return res.json({
      message: "Free trial activated",
      freeTrial: user.freeTrial,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message }); 
  }
});



router.post("/start-membership", authenticateToken, async (req, res) => {
  try {
    const { planType } = req.body;
     // monthly, quarterly, yearly, custom
    const user = await User.findById(req.user.id);
   

    if (!user) return res.status(404).json({ message: "User not found" });

    console.log(user.name)

    // Activate membership
    user.membership.status = "active";
    user.membership.startDate = new Date();

    let duration;
    switch (planType) {
      case "monthly":
        duration = 30;
        break;
      case "quarterly":
        duration = 90;
        break;
      case "yearly":
        duration = 365;
        break;
      case "custom":
        duration = req.body.customDays || 30;
        break;
      default:
        duration = 30;
    }

    user.membership.expiryDate = new Date(Date.now() + duration * 24 * 60 * 60 * 1000);
    user.membership.planType = planType;

    await user.save();

    console.log('saved')

    return res.json({
      message: "Membership activated",
      membership: user.membership,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
});

// Get user from token
router.get('/current', getUserFromToken);


// Get all Users
router.get('/all', authenticateAdmin, getAllUsers);

// Get user by ID
router.get('/:id', authenticateToken, getUserById);

//delete user by ID
router.delete('/user/:id', authenticateAdmin, deleteUser);

// Update current user
router.put('/update/current', authenticateToken, updateUserData);

// Update user by ID
router.put('/update/:id', authenticateAdmin, updateUserDataByAdmin);

//address routes
router.use('/address/create', authenticateToken, createAddress);

// Route to update an address by ID
router.put('/address/update/:id', authenticateToken, updateAddressById);

// Route to get an address by ID
router.get('/address/:id', authenticateToken, getAddressById);

// Route to get all address 
router.get('/address/get/all', authenticateToken, getAllAddress);

// Route to get all current user address
router.get('/address/get/current', authenticateToken, getCurrentUserAddresses);


// Route to delete an address by ID
router.delete('/address/:id', authenticateToken, deleteAddressById);

// Route to get all saved offers for current user
router.get('/get/saved-offers', authenticateToken, getSavedOffers);

//Route to save expo push token
router.post('/save-push-token', authenticateToken, savePushToken);


export default router;
