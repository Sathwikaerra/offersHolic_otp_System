import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";

const router = express.Router();

// Initialize Razorpay
const key=process.env.RAZORPAY_KEY;
const secret=process.env.RAZORPAY_SECRET


const razorpay = new Razorpay({
  key_id: key,
  key_secret: secret,
});






router.post("/verify-payment", (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  // Generate expected signature
  const generated_signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET) 
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  if (generated_signature === razorpay_signature) {
    // Payment verified
    // ✅ Money has been transferred to your Razorpay account
    res.json({ success: true, message: "Payment verified successfully" });
  } else {
    res.status(400).json({ success: false, message: "Payment verification failed" });
  }
});





// POST /create-order
router.post("/create-order", async (req, res) => {
  try {

    console.log(key,secret)
    

    const { amount, currency } = req.body;

    console.log(amount,currency)

    const options = {
      amount: amount * 100, // convert to paise
      currency: currency || "INR",
      receipt: `receipt_order_${Date.now()}`,
    };
    console.log('options created')

    const order = await razorpay.orders.create(options);

    console.log(order)

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
