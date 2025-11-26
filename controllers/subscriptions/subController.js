import Razorpay from 'razorpay';
import PlanPricing from '../../models/Plans.js';
import dotenv from "dotenv";

dotenv.config();



const RAZORPAY_KEY = process.env.RAZORPAY_KEY;
const RAZORPAY_SECRET = process.env.RAZORPAY_SECRET;

const razorpay = new Razorpay({
    
    key_id: RAZORPAY_KEY,
    key_secret: RAZORPAY_SECRET,
});

// Create or update a PlanPricing
export const createPlan = async (req, res) => {
    try {
        const { name, description, amount, currency, period, noOfBusinessProfilesAllowed } = req.body

        if (name === "" || description === "" || amount === "" || currency === "" || period === "" || noOfBusinessProfilesAllowed === "" || undefined) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }

        // Create Razorpay plan
        const plan = await razorpay.plans.create({
            period: period,
            interval: 1,

            item: {
                name: name,
                amount: amount * 100,
                currency: "INR",
                description: description,
            },
            notes: {
                noOfBusinessProfilesAllowed: noOfBusinessProfilesAllowed
            }
        });

        if (plan.error) {
            return res.status(400).json({ success: false, message: 'Failed to create plan' });
        }


        const newPlanPricing = await PlanPricing.create({
            name,
            description,
            currency,
            amount,
            period,
            razorpay_plan_id: plan.id,
            noOfBusinessProfilesAllowed: noOfBusinessProfilesAllowed
        });
        return res.status(201).json({ success: true, data: newPlanPricing });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getAllPlans = async (req, res) => {
    try {
        const plans = await PlanPricing.find();
        return res.status(200).json({ success: true, data: plans, count: plans.length, confirm: "All plans fetched" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getPlanById = async (req, res) => {
    try {
        const { id } = req.params;
        const plan = await PlanPricing.findById(id);
        if (!plan) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }
        return res.status(200).json({ success: true, data: plan });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getSubscriptions = async (req, res) => {
    try {
        const { id } = req.params;
        const plan = await PlanPricing.findById(id);
        if (!plan) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }
        const subscriptions = await razorpay.subscriptions.all({ plan_id: plan.razorpay_plan_id });
        return res.status(200).json({ success: true, plan_id: plan.razorpay_plan_id, ...subscriptions });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};


export const createSubscription = async (req, res) => {
    try {
        const { plan_id, quantity } = req.body;
        if (!plan_id) {
            return res.status(400).json({ success: false, message: 'Please provide a plan_id' });
        }

        const razorpay_plan_id = await PlanPricing.findById(plan_id);

        if (!razorpay_plan_id) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }

        const subscription = await razorpay.subscriptions.create({
            plan_id: razorpay_plan_id.razorpay_plan_id,
            customer_notify: 1,

            notes: {
                noOfBusinessProfilesAllowed: razorpay_plan_id.noOfBusinessProfilesAllowed * quantity || 1
            },
            total_count: 12,
            quantity: quantity || 1
        });
        return res
            .status(201)
            .json({
                success: true,
                message: "Subscription created successfully",
                data: subscription,
            });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const verifySubscriptionPayment = async (req, res) => {

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
        await req.json();
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    console.log("id==", body);

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_APT_SECRET)
        .update(body.toString())
        .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
        console.log(Payment);

        await Payment.create({
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        });

        //  return NextResponse.redirect(new URL('/paymentsuccess', req.url));
    } else {
        return NextResponse.json(
            {
                message: "fail",
            },
            {
                status: 400,
            }
        );
    }

    return NextResponse.json(
        {
            message: "success",
        },
        {
            status: 200,
        }
    );
};

export const getSubscriptionById = async (req, res) => {
    try {
        const { id } = req.params;
        const subscription = await razorpay.subscriptions.fetch(id);
        return res.status(200).json({ success: true, data: subscription });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};


export const deletePlan = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ success: false, message: 'Plan ID is required' });
        }
        // const plan = await PlanPricing.findById(id);
        // const subscriptions = await razorpay.subscriptions.all({ plan_id: plan.razorpay_plan_id });

        // if (subscriptions.items.length > 0) {
        //     return res.status(400).json({ success: false, message: 'Cannot delete plan with active subscriptions' });
        // } //uncomment this in production to prevent deleting plans with active subscriptions


        const deletedPlan = await PlanPricing.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: 'Plan deleted successfully',
            data: deletedPlan,
        });
    } catch (error) {
        console.error('Error deleting plan:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// // Delete a PlanPricing by ID
// export const deletePlanPricingById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ success: false, message: 'Invalid ID format' });
//     }

//     const deletedPlanPricing = await PlanPricing.findByIdAndDelete(id);

//     if (!deletedPlanPricing) {
//       return res.status(404).json({ success: false, message: 'PlanPricing not found' });
//     }

//     res.status(200).json({ success: true, message: 'PlanPricing deleted successfully', data: deletedPlanPricing });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: 'Internal Server Error' });
//   }
// };

// // Get all PlanPricing entries with service populated
// export const getAllPlanPricingPopulated = async (req, res) => {
//   try {
//     const planPricingList = await PlanPricing.find()
//       .populate({
//         path: 'service',
//         populate: [
//           {
//             path: 'laundryPerPair.items',
//             model: Product,
//             populate: {
//               path: 'category',
//               model: Category,
//             },
//           },
//           {
//             path: 'laundryByKG.items',
//             model: Product,
//             populate: {
//               path: 'category',
//               model: Category,
//             },
//           },
//         ],
//       });

//     res.status(200).json({ success: true, data: planPricingList });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: 'Internal Server Error' });
//   }
// };


// // Get a PlanPricing by ID with service populated
// export const getPlanPricingById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const planPricingDetail = await PlanPricing.findById(id).populate('service');

//     if (!planPricingDetail) {
//       return res.status(404).json({ success: false, message: 'PlanPricing not found' });
//     }

//     res.status(200).json({ success: true, data: planPricingDetail });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: 'Internal Server Error' });
//   }
// };


// export const deleteMultiplePlanPricingByIds = async (req, res) => {
//   try {
//     const { ids } = req.body;

//     if (!ids.every(id => mongoose.Types.ObjectId.isValid(id))) {
//       return res.status(400).json({ success: false, message: 'Invalid ID format in the request body' });
//     }

//     const deletedPlanPricing = await PlanPricing.deleteMany({ _id: { $in: ids } });

//     if (deletedPlanPricing.deletedCount === 0) {
//       return res.status(404).json({ success: false, message: 'No matching documents found' });
//     }

//     res.status(200).json({ success: true, message: 'PlanPricing deleted successfully', deletedCount: deletedPlanPricing.deletedCount });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: 'Internal Server Error' });
//   }
// };