import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
import errorHandler from "./middlewares/error/errorHandler.js";
import authRoute from "./routes/v1/auth/authRoutes.js";
import userRoute from "./routes/v1/user/userRoutes.js";
import categoryRoute from "./routes/v1/category/categoryRoutes.js";
import businessRoute from "./routes/v1/business/businessRoutes.js";
import subscriptionsRoute from "./routes/v1/subscriptions/subscriptionRoute.js";
// import adRoute from "./routes/v1/ads/adRoutes.js";
import offerRoute from "./routes/v1/offer/offerRoute.js";
import teamRoute from "./routes/v1/team/teamRoute.js";
// import shareRouter from './routes/v1/share/share.js'
import cookieParser from "cookie-parser";
import notifcationRoute from "./routes/v1/notifications/notificationRoutes.js";
import paymentRoute from "./routes/v1/payments/paymentRoute.js";
import plansRoutes from "./routes/v1/plans/plansRoutes.js";




import './services/cron/cronService.js';
import path from "path";
import { fileURLToPath } from 'url';
import share from "./controllers/share/share.js";

import cron from "node-cron";
import Offer from "./models/Offer.js"; // adjust path as needed

// 🕒 Run every day at midnight
cron.schedule("0 0 * * *", async () => {
  try {
    const now = new Date();

    // 1️⃣ Mark expired offers as inactive and expired
    const updated = await Offer.updateMany(
      { offerExpiryDate: { $lte: now }, status: { $ne: "expired" } },
      { $set: { active: false, status: "expired" } }
    );

    console.log(`✅ Offer expiry check complete. ${updated.modifiedCount} offers marked as expired.`);
  } catch (err) {
    console.error("❌ Error checking expired offers:", err);
  }
});


// import "./services/cron/cronService.js"
dotenv.config();



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Retry connection to MongoDB
const connectWithRetry = () => {
  console.log('MongoDB connection with retry');
  return mongoose.connect(process.env.DB_URL).then(() => {
    console.log('MongoDB is connected');
  }).catch((err) => {
    console.error('MongoDB connection unsuccessful, retry after 5 seconds. ', err);
    setTimeout(connectWithRetry, 5000);
  });
};

connectWithRetry();

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cookieParser());

app.use(cors({ origin: "*" }));

// Enable CORS for a specific origin
app.use(cors({
  origin: '*',
  credentials: true
}))
//change this to frontend url before production


// Set up session management
app.use(session({
  secret: 'your-session-secret',
  resave: false, 
  saveUninitialized: true,
  cookie: { secure: true, httpOnly: true }  // Set to true if using HTTPS
}));

// Basic home routez
app.get("/", (req, res) => {
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OffersHolic: Find Nearest Deals</title>
        
        <!-- Open Graph Metadata -->
        <meta property="og:title" content="OffersHolic: Find Nearest Deals">
        <meta property="og:description" content="Discover unbeatable offers right at your fingertips! OffersHolic connects you with the best deals near you based on your current location. Whether you’re a savvy shopper looking for discounts or a business owner eager to showcase your latest offers, OffersHolic is your go-to platform. Explore, save, and share amazing deals—all in one place! Join our community and never miss an offer again!">

        <meta property="og:image" content="https://admin.offersholic.zephyrapps.in/_next/image?url=%2Fimages%2Fprimary-transparent.png&w=256&q=75">
        <meta property="og:url" content="https://www.offersholic.com">
        <meta property="og:type" content="website">

        <!-- Twitter Metadata -->
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="OffersHolic: Find Nearest Deals">
        <meta name="twitter:description" content="Discover unbeatable offers right at your fingertips! OffersHolic connects you with the best deals near you based on your current location. Whether you’re a savvy shopper looking for discounts or a business owner eager to showcase your latest offers, OffersHolic is your go-to platform. Explore, save, and share amazing deals—all in one place! Join our community and never miss an offer again!">
        <meta name="twitter:image" content="https://admin.offersholic.zephyrapps.in/_next/image?url=%2Fimages%2Fprimary-transparent.png&w=256&q=75">
        <meta name="twitter:url" content="https://www.offersholic.com">
        <script>
          setTimeout(() => {
            window.location.href = 'https://offersholic-a5792.web.app/';
          }, 1000);
        </script>


        <style>
            body {
                background-color: #c82037;
                color: #ffffff;
                font-family: Lexend, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
            }
            .container {
                text-align: center;
                padding: 20px;
                border: 1px solid #333;
                border-radius: 8px;
                background-color: #ffffff;
            }
            .icon {
                height: 50px;
                margin-bottom: 20px;
            }
            .title {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 10px;
                font-family: Lexend, sans-serif;
                color: #232122;
            }
            .description {
                font-size: 18px;
                margin-bottom: 20px;
                color: #232122;
                font-family: Lexend, sans-serif;
            }
            .image {
                width: 100%;
                max-width: 150px;
                max-height: 300px;
                resize-mode: 'cover';
                border-radius: 8px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <img 
            class="icon" src="https://admin.offersholic.zephyrapps.in/_next/image?url=%2Fimages%2Fprimary-transparent.png&w=256&q=75" alt="App Icon">
            <div class="title">Welcome to OffersHolic!</div>
            <div class="description">Discover unbeatable offers right at your fingertips! OffersHolic connects you with the best deals near you based on your current location. Whether you’re a savvy shopper looking for discounts or a business owner eager to showcase your latest offers, OffersHolic is your go-to platform. Explore, save, and share amazing deals—all in one place! Join our community and never miss an offer again!</div>
           
        </div>
    </body>
    </html>
  `)
  res.redirect("https://offersholic-a5792.web.app/")
});


app.use("/auth/v1", authRoute);
app.use("/user/v1", userRoute);
app.use("/categories/v1", categoryRoute);
app.use("/business/v1", businessRoute);
app.use("/subscriptions/v1", subscriptionsRoute); 
app.use("/offer/v1", offerRoute);
app.use("/team/v1", teamRoute);
app.use('/notifications/v1',notifcationRoute );
app.use('/payments/v1',paymentRoute );
app.use("/plans/v1", plansRoutes);
// app.use("/share", shareRouter);
// app.use("/coupons/v1", couponRoute);



// app.use("/media/v1", mediaControllRoute);

//run cron jobs

app.get("/share/:type/:id", share);

app.get('/apple-app-site-association', (req, res) => {
  res.setHeader('Content-Type', 'application/json'); // Set the correct MIME type
  res.sendFile(path.join(__dirname, 'apple-app-site-association'));
});

//assetlinks.json 
app.get('/.well-known/assetlinks.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json'); // Set the correct
  res.sendFile(path.join(__dirname, './assetlinks.json'));
}
);


app.use(errorHandler);
app.listen(process.env.PORT , () => {
  console.log("http:localhost: " + process.env.PORT);
});