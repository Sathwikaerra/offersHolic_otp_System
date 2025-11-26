import Razorpay from "razorpay";
// import User from "../models/user.js";
import Subscription from "../../models/Subscriptions.js";
// import Subscription from "../models/subscription.js";
import dotenv from "dotenv";

dotenv.config();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET,
});


// verify payment
// export const verifyPayment = async (req, res) => {
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
//         await req.json();
//     const body = razorpay_order_id + "|" + razorpay_payment_id;
//     console.log("id==", body);

//     const expectedSignature = crypto
//         .createHmac("sha256", process.env.RAZORPAY_APT_SECRET)
//         .update(body.toString())
//         .digest("hex");

//     const isAuthentic = expectedSignature === razorpay_signature;

//     if (isAuthentic) {
//         console.log(Payment);

//         await Payment.create({
//             razorpay_order_id,
//             razorpay_payment_id,
//             razorpay_signature,
//         });

//         //  return NextResponse.redirect(new URL('/paymentsuccess', req.url));
//     } else {
//         return NextResponse.json(
//             {
//                 message: "fail",
//             },
//             {
//                 status: 400,
//             }
//         );
//     }

//     return NextResponse.json(
//         {
//             message: "success",
//         },
//         {
//             status: 200,
//         }
//     );
// };

//verify subscription status
// export const verifySubscription = async (userRazorpaySubscriptionId) => {
//     try {
//         const subscription = await razorpay.subscriptions.fetch(userRazorpaySubscriptionId);

//         if (subscription.status === 'active') {
//             return true;
//         } else {
//             return false;
//         }
//     } catch (error) {
//         console.error('Error verifying subscription:', error);
//         throw new Error('Subscription verification failed');
//     }
// };


export const createPlan = async (req, res) => {
    const { period, interval, item, user_id } = req.body;
    console.log('req.body', req.body)

    try {
        // Check if a subscription with the provided details already exists
        // const existingSubscription = await Subscription.findOne({
        //     period,

        // });
        // console.log('existingSubscription', existingSubscription)

        // const fetchPlan = await razorpay.plans.fetch(existingSubscription.razorpay_plan_id);
        // if (fetchPlan) {
        //     return res.status(200).json({
        //         message: "Subscription already exists",
        //         subscription: existingSubscription,
        //         plan: fetchPlan
        //     });
        // }
        // Create Razorpay plan
        const plan = await razorpay.plans.create({
            period: period,
            interval: interval,
            item: {
                name: item.name,
                amount: item.amount,
                currency: "INR",
                description: item.description,
            },
            notes: {
                // service_id,
                user_id
            },
        });

        // Update the user's customerType to 'subscriber'
        // const updatedUser = await User.findByIdAndUpdate(
        //     user_id,
        //     { customerType: 'subscriber' },
        //     { new: true }
        // );

        // Create a new subscription record
        const subscription = new Subscription({
            period,
            razorpay_plan_id: plan.id,
        });
        await subscription.save();

        return res.status(200).json({
            message: "Plan Created successfully",
            plan: plan,
            // updatedUser: updatedUser,
            subscription: subscription // Include the created subscription in the response
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Internal Server Error",
        });
    }
};