// plans.js
import express from "express";
import PlanPricing from "../../../models/Plans.js"; // adjust path as needed
import {authenticateAdmin} from '../../../middlewares/auth/authMiddleware.js'

const router = express.Router();


router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const plan = await PlanPricing.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    await plan.deleteOne(); // delete the plan

    res.status(200).json({ message: 'Plan deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});






// ✅ Create a new plan
router.post('/create', async (req, res) => {
  try {
    const {
      name,
      description,
      currency,
      amount,
      period,
      noOfBusinessProfilesAllowed,

    } = req.body;

    // Basic validation
    if (
      !name ||
      !description ||
      !amount ||
      !period ||
      !noOfBusinessProfilesAllowed
    ) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    const newPlan = new PlanPricing({
      name,
      description,
      currency: currency || 'INR',
      amount,
      period,
      noOfBusinessProfilesAllowed,
    });

    await newPlan.save();

    res.status(201).json({ message: 'Plan created successfully', plan: newPlan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});




// GET /user/v1/plans
router.get("/all", async (req, res) => {
  try {
    const plans = await PlanPricing.find();
    console.log(plans)
    res.status(200).json({
      ok: true,
      data: plans,
    });
  } catch (error) {
    console.error("Error fetching plans:", error);
    res.status(500).json({ success: false, message: "Failed to fetch plans" });
  }
});

export default router;
