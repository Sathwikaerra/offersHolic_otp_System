# Offersholic-backend

## Project Structure

Offersholic-backend/
│
├── config/
│ ├── config.js
│ ├── db.js
│ └── constants.js
│
├── controllers/
│ ├── auth/
│ │ └── authController.js
│ ├── user/
│ │ └── userController.js
│ ├── ad/
│ │ └── adController.js
│ ├── transaction/
│ │ └── transactionController.js
│ ├── category/
│ │ └── categoryController.js
│ ├── team/
│ │ └── teamController.js
│ └── notification/
│ └── notificationController.js
│
├── models/
│ ├── User.js
│ ├── Ad.js
│ ├── Transaction.js
│ ├── Category.js
│ ├── Team.js
│ ├── BusinessProfile.js
│ └── Notification.js
│
├── routes/
│ ├── auth/
│ │ └── authRoutes.js
│ ├── user/
│ │ └── userRoutes.js
│ ├── ad/
│ │ └── adRoutes.js
│ ├── transaction/
│ │ └── transactionRoutes.js
│ ├── category/
│ │ └── categoryRoutes.js
│ ├── team/
│ │ └── teamRoutes.js
│ ├── notification/
│ │ └── notificationRoutes.js
│ └── index.js
│
├── middlewares/
│ ├── auth/
│ │ └── authMiddleware.js
│ └── error/
│ └── errorHandler.js
│
├── services/
│ ├── email/
│ │ └── emailService.js
│ ├── payment/
│ │ └── paymentService.js
│ ├── notification/
│ │ └── notificationService.js
│ └── cron/
│ └── cronService.js
│
├── utils/
│ ├── otp/
│ │ └── otpGenerator.js
│ └── helpers/
│ └── helpers.js
│
├── .env
├── server.js
└── package.json



## Overview

This repository contains the backend implementation for the Offersholic application. It is organized into several key directories:

- **config/**: Configuration files including `config.js`, `db.js`, and `constants.js`.
- **controllers/**: Handles logic for different modules like authentication, user management, ads, transactions, categories, teams, and notifications.
- **models/**: Mongoose schemas for User, Ad, Transaction, Category, Team, BusinessProfile, and Notification.
- **routes/**: Express routes for different API endpoints structured by modules.
- **middlewares/**: Contains authentication middleware (`auth/authMiddleware.js`) and error handling middleware (`error/errorHandler.js`).
- **services/**: Business logic services including email handling (`email/emailService.js`), payment processing (`payment/paymentService.js`), notification handling (`notification/notificationService.js`), and cron jobs (`cron/cronService.js`).
- **utils/**: Utility functions for OTP generation (`otp/otpGenerator.js`) and general helpers (`helpers/helpers.js`).
- **.env**: Environment variables configuration file.
- **server.js**: Entry point for starting the server.
- **package.json**: Node.js package configuration.

## Getting Started

1. **Installation**

   ```bash
   npm install
