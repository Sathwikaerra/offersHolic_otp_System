import express from "express";
import {
    createPlan,
    createSubscription,
    deletePlan,
    getAllPlans,
    getPlanById,
    getSubscriptionById,
    getSubscriptions,
    verifySubscriptionPayment
} from "../../../controllers/subscriptions/subController.js";
import { authenticateAdmin } from "../../../middlewares/auth/authMiddleware.js";


const router = express.Router();


// create new subscription plan
router.post("/createPlan", authenticateAdmin, createPlan);

// List all subscription plans
router.get("/all", getAllPlans);

// Get a subscription Plan by ID
router.get("/get/:id", getPlanById);

router.delete("/delete/plan/:id", authenticateAdmin, deletePlan);

//Create new subscription order
router.post("/createSubscription", createSubscription);

//Get all subscriptions of a plan
router.get("/subscriptions/all/:id", getSubscriptions);

//get subscription by id
router.get("/subscription/:id", getSubscriptionById);

//verify subscription payment
router.post("/verify", verifySubscriptionPayment);

// Edit a team member
// router.put("/edit/:id", editTeamMember);

// Delete a team member
// router.delete("/delete/:id", deleteTeamMember);



// router.put('/ad/status/admin/:adId', changeAdStatusForAdmin);

export default router;
