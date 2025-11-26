import jwt from "jsonwebtoken";
import axios from "axios";
import { mobileVerificationSuccess } from "../../config/sendSms.js";
import User from "../../models/User.js";
import UserOTP from "../../models/Otp.js";
import { sendLoginSuccess, sendOtpEmail, sendWelcomeEmail } from "../../config/zohoMail.js";



import dotenv from "dotenv";
dotenv.config();

// controllers/auth.controller.js

export const updateFullName = async (req, res) => {
  try {
    const { userId, first, middle, last } = req.body;
    console.log('update Fullname starting')

    if (!userId || !first || !last) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = { first, middle: middle || "", last };
    await user.save();

    res.status(200).json({ message: "Name updated successfully", user });
  } catch (err) {
    console.error("Update Name Error:", err.message);
    res.status(500).json({ message: "Failed to update name" });
  }
};


// ✅ Send OTP
export const sendOtp = async (req, res) => {
  try {
    const { mobileNumber } = req.body;
    if (!mobileNumber) return res.status(400).json({ message: "Mobile number required" });

    // Generate OTP via 2Factor SMS API
    const response = await axios.get(
      `https://2factor.in/API/V1/${process.env.TWO_FACTOR_API_KEY}/SMS/91${mobileNumber}/AUTOGEN`
    );

    // Return session ID (used for verifying)
    res.status(200).json({
      message: "OTP sent successfully",
      sessionId: response.data.Details,
    });
  } catch (error) {
    console.error("OTP Send Error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

// ✅ Verify OTP and then create/login user
export const verifyOtp = async (req, res) => {
  try {
    const { mobileNumber, otp, sessionId } = req.body;

    if (!mobileNumber || !otp || !sessionId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Verify OTP using 2Factor API
    const verifyRes = await axios.get(
      `https://2factor.in/API/V1/${process.env.TWO_FACTOR_API_KEY}/SMS/VERIFY/${sessionId}/${otp}`
    );

    if (verifyRes.data.Details !== "OTP Matched") {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // ✅ OTP is correct → Check if user exists
    let user = await User.findOne({ mobileNumber });

    // If new user → create account
    if (!user) {
      user = await User.create({
        mobileNumber,
        profile: { profileType: "User" },
        status: "accepted",
      });
    }

    // ✅ Generate JWT token
   const token = jwt.sign(
  { id: user._id, role: user.profile.profileType || "User" },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);

    res.status(200).json({
      message: "OTP verified successfully",
      token,
      user,
    });
  } catch (error) {
    console.error("OTP Verify Error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to verify OTP" });
  }
};



//register controllers

//initial request for registration
export const sendOtpforRegistration = async (req, res) => {
  try {
    const { email, mobileNumber } = req.body;
    console.log('Request Body:', req.body);

    if (!email && !mobileNumber) {
      return res.status(400).send({
        ok: false,
        msg: 'Email or mobile number is required',
      });
    }

    let validEmailUser
    let validMobileNumberUser
    if (email && !mobileNumber) {
      validEmailUser = await User.findOne({ "email": email });
      console.log('Valid Email User:', validEmailUser);

      if (validEmailUser) {
        return res.status(409).send({
          ok: false,
          msg: 'Email already exists',
        });
      }

    }

    if (!email && mobileNumber) {
      validMobileNumberUser = await User.findOne({ "mobileNumber": mobileNumber });
      console.log('Valid Mobile Number User:', validMobileNumberUser);

      if (validMobileNumberUser) {
        return res.status(409).send({
          ok: false,
          msg: 'Mobile number already exists',
        });
      }

      if (!email && !mobileNumber) {
        return res.status(400).send({
          ok: false,
          msg: 'Email or mobile number is required',
        });
      }
    }

    const userName = validEmailUser ? validEmailUser.name.first : "User";

    //send otp based on the email or mobile number
    if (email) {
      // Generate OTP
      // let OTP = Math.floor(Math.random() * 900000) + 100000;
      // console.log("OTP is generated", OTP);
      // console.log(email, "email instie")
      // let otp = new UserOTP({
      //   email: email,
      //   otp: OTP,
      //   createdAt: new Date(),
      //   expireAt: new Date(Date.now() + 86400000), // Set expiration time correctly
      // });

      // await otp.save();

      // const userName = validEmailUser ? validEmailUser.name.first : "User";
          // Generate OTP and send for verification
    let otpResult;
    otpResult = await sendEmailOTPforverification(req, res);

      // await sendEmailWithTemplate
    } else {
      const url = `https://2factor.in/API/V1/28ddde3b-8f14-11ef-8b17-0200cd936042/SMS/${mobileNumber}/AUTOGEN/OTPTEMPLATE_`;

      const response = await axios.get(url, { maxBodyLength: Infinity });

      console.log('Response Data:', response.data);

      if (response.data.Status === 'Success') {
        return res.status(200).send({
          ok: true,
          msg: 'OTP sent successfully',
          data: response.data,
        });
      } else {
        return res.status(400).send({
          ok: false,
          msg: 'Failed to send OTP',
          data: response.data,
        });
      }
    }

    return res.status(200).send({
      ok: true,
      msg: validEmailUser ? "Email sent to existing user" : "Email sent to new user",
    });

    


  } catch (error) {
    console.error("Error in sending OTP for verification:", error);
    return {
      ok: false,
      msg: error.message,
    };
  }

}

//next step for registration, verify otp and register user
export const register = async (req, res) => {
  try {
    const {
      email,
      mobileNo,
      firstName,
      middleName,
      lastName,
      otp,
      profileType
    } = req.body;

    console.log('Request Body:', req.body);
    console.log("entered")
    // Check if either email or mobile number is provided
    if (!email && !mobileNo) {
      return res.status(400).json({ msg: "Email or mobile number is required" });
    }
    let existingUser;

    if (email) {
      existingUser = await User.findOne({ "email": email });
    } else {
      existingUser = await User.findOne({ "mobileNumber": mobileNo });
    }


    if (existingUser) {
      return res.status(404).json({ msg: "Email or mobile number already exists", ok: false });
    }

    const otpVerifyResponse = await verifyOtpCore(email, mobileNo, otp);


    if (!otpVerifyResponse.ok) {
      return res.status(otpVerifyResponse.statusCode).json({ msg: otpVerifyResponse.msg });
    }

    // Prepare user data
    const userData = {

      name: {

        first: firstName || "",
        middle: middleName || "",
        last: lastName || "",
      },
      profile: {
        profileType: profileType || "User",
      }
    };
    
    if (email) {
      userData.email = email;
    }
    if (mobileNo) {
      userData.mobileNumber = mobileNo;
    }

    // Create a new user instance
    const newUser = new User(userData);
    const savedUser = await newUser.save();




    // Update the user's profileRef
    // await User.findByIdAndUpdate(savedUser._id, {
    //   $set: {
    //     "profile.profileRef": savedUser._id,
    //   },
    // });



    // Create a token if not provided by OTP verification
    let token = otpVerifyResponse.token;
    if (!token) {
      const tokenPayload = {
        id: savedUser._id,
        role: savedUser.profile.profileType,
      };
      token = jwt.sign(tokenPayload, process.env.JWT_SECRETKEY);
    }

    //send cookies to the client and set the token in the cookie with httponly and expiry time
    res.cookie("accessToken", token, { httpOnly: true });

    // Send the response
    await sendWelcomeEmail(savedUser.email, savedUser.name.first);
    res.status(200).json({
      msg: "User registered successfully",
      ok: true,
      token,
      user: savedUser,
    });


  }
  catch (error) {
    console.error("Error in registerUser:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }

}


//login controllers

//-------------------admin login routes-------------------
export const adminLogin = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).send({
        msg: "Email is required",
        ok: false,
      });
    }

    let query;

    query = { "email": email.toLowerCase().trim() };


    const user = await User.findOne(query);

    if (!user) {
      return res.status(404).send({
        msg: "User not found",
        ok: false,
      });
    }

    //check if the user is an organization
    if (user.profile.profileType.includes("User")) {
      return res.status(404).send({
        msg: "User is not an admin",
        ok: false,
      });

    }

    // Generate OTP and send for verification
    let otpResult;
    if (email) {
      otpResult = await sendEmailOTPforverification(req, res);
    } else {
      // otpResult = await sendMobileOTPforVerification(req, res);
    }

    if (!otpResult.ok) {
      return res.status(500).send({
        msg: "Failed to send OTP",
        ok: false,
      });
    } else {
      return res.status(200).send({
        msg: "OTP sent successfully",
        ok: true,
      });

    }
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).send({
      msg: "Internal Server Error",
      ok: false,
    });
  }
};

//-------------------user login routes-------------------
//login with email
export const UserEmailLogin = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(email)

    if (!email) {
      return res.status(400).send({
        msg: "Email is required",
        ok: false,
      });
    }

    if (email === "testing@offersholic.zephyrapps.in") {
      //for testing purposes
      return res.status(200).send({
        msg: "Verification successful",
        ok: true,
      });
    }


    const user = await User.findOne({ "email": email.toLowerCase().trim() });

    if (!user) {
      return res.status(404).send({
        msg: "User not found",
        ok: false,
      });
    }



    //check if the user is an organization
    if (user.profile.profileType !== "User") {
      return res.status(404).send({
        msg: "Admin can't login as user",
        ok: false,
      });

    }

    // Generate OTP and send for verification
    let otpResult;

    otpResult = await sendEmailOTPforverification(req, res);


    if (!otpResult.ok) {
      return res.status(500).send({
        msg: "Failed to send OTP",
        ok: false,
      });
    } else {
      return res.status(200).send({
        msg: "OTP sent successfully",
        ok: true,
      });

    }
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).send({
      msg: "Internal Server Error",
      ok: false,
    });
  }
};

//login with mobile number
export const UserMobileLogin = async (req, res) => {
  try {
    const { mobileNumber } = req.body;
    console.log('Request Body:', req.body);

    const validMobileNumberUser = await User.findOne({ mobileNumber: mobileNumber });

    if (!validMobileNumberUser) {
      return res.status(404).send({
        ok: false,
        msg: 'User with this mobile number not found',
      });
    }

    //check if the user is an organization
    if (validMobileNumberUser.profile.profileType !== "User") {
      return res.status(404).send({
        msg: "Admin can't login as user",
        ok: false,
      });

    }

    const url = `https://2factor.in/API/V1/22738544-8a37-11f0-a562-0200cd936042/SMS/${mobileNumber}/AUTOGEN/OTPTEMPLATE_`;

    const response = await axios.get(url, { maxBodyLength: Infinity });

    console.log('Response Data:', response.data);

    if (response.data.Status === 'Success') {
      return res.status(200).send({
        ok: true,
        msg: 'OTP sent successfully',
        data: response.data,
      });
    } else {
      return res.status(400).send({
        ok: false,
        msg: 'Failed to send OTP',
        data: response.data,
      });
    }
  } catch (error) {
    console.error('Error in sendOTPforMobileVerification:', error);
    return res.status(500).send({
      msg: error.message,
    });
  }
};


//verify otp
export const verifyotp = async (req, res) => {
  try {
    const { email, mobileNo, otp } = req.body;
    console.log('Request Body:', req.body);
    if (!email && !mobileNo) {
      return res.status(400).send({
        msg: "Email or mobile number is required",
        ok: false,
      });
    }


    const testToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2ZmRhZWVjOWY5MDk5MjQ4MTYwYWMxMyIsInJvbGUiOiJVc2VyIiwiaWF0IjoxNzI3OTAxNDIwfQ.XpZJ9GQHUn_F47vqZMAQYEr0mb19eM8pKNNBsOKH7xU";
    console.log('Test Token:', email);
    if (email === "testing@offersholic.zephyrapps.in" && otp === "123456") {
      return res.status(200).send({
        msg: "Verification successful",
        ok: true,
        token: testToken,
      });
    }

    if (email === "testing@offersholic.zephyrapps.in" && otp !== "123456") {
      return res.status(401).send({
        msg: "Wrong OTP",
        mode: "test",
        ok: false,
      });
    }

    const result = await verifyOtpCore(email, mobileNo, otp);
    console.log('Result:', result);
    if (!result.ok) {
      return res.status(404).send({
        msg: result.msg,
        ok: false,
      });
    }


    return res.status(200).send({
      msg: result.msg,
      ok: true,
      token: result.token,


    });
  } catch (error) {
    console.error("Error in verifyotp:", error);
    res.status(500).send({
      msg: "Internal Server Error",
      ok: false,
    });
  }
};


// functions for otp verification
const verifyOtpCore = async (email, mobileNo, otp) => {
  try {
    let field, value, verificationSuccessFunction, provider;
    if (email) {
      field = "email";
      value = email;
      verificationSuccessFunction = sendLoginSuccess;
      provider = "email";
    } else {
      field = "mobileNumber";
      value = `${mobileNo}`;
      verificationSuccessFunction = mobileVerificationSuccess;
      provider = "phone";
      // External API verification for mobile OTP
      const url = `https://2factor.in/API/V1/22738544-8a37-11f0-a562-0200cd936042/SMS/VERIFY3/${mobileNo}/${otp}`;
    
      const response = await axios.get(url, { maxBodyLength: Infinity });
      
      if (response.data.Status !== 'Success') {
        return { ok: false, msg: response.data.Details, statusCode: 401 };
      }
    }
    
    console.log(field)
    // Internal OTP verification for email
    if (email) {
      
      const databaseOtp = await UserOTP.find({email});
      console.log(databaseOtp)

      if (!databaseOtp || databaseOtp.length === 0) {
        return { ok: false, msg: "No OTP records found", statusCode: 404 };
      }

      const matchingOTP = databaseOtp.find((record) => record.otp == otp);

      if (!matchingOTP) {
        return { ok: false, msg: "Wrong OTP!", statusCode: 401 };
      }

      const currentTime = new Date();
      const createdAt = new Date(matchingOTP.createdAt);
      const timeDifference = currentTime - createdAt;

      if (timeDifference > 900000) {
        await UserOTP.deleteMany({ [field]: value });
        return { ok: false, msg: "Your OTP has expired, can't verify", statusCode: 402 };
      }
    }

    const searchCriteria =
      field === "email"
        ? { "email": value }
        : { "mobileNumber": mobileNo };

    const validUser = await User.findOne(searchCriteria);

    if (!validUser) {
      return { ok: true, msg: "Verification successful", token: null, statusCode: 202, provider };
    }

    const tokenPayload = {
      id: validUser._id,
      role: validUser.profile.profileType,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRETKEY);

    if (email) {
      await UserOTP.deleteMany({ [field]: value });
      await verificationSuccessFunction(value);
    }

    return { ok: true, msg: "Verification successful", token: token, statusCode: 200, provider };
  } catch (error) {
    console.error("Error in verifyOtpCore:", error);
    return { ok: false, msg: "Internal Server Error", statusCode: 500 };
  }
};



export const sendEmailOTPforverification = async (req, res) => {
  try {
    const { email } = req.body;
    const validEmailUser = await User.findOne({ "email": email });
    let OTP = Math.floor(Math.random() * 900000) + 100000;
    console.log("OTP is generated", OTP);

    let otp = new UserOTP({
      email: email,
      otp: OTP,
      createdAt: new Date(),
      expireAt: new Date(Date.now() + 86400000), // Set expiration time correctly
    });

    await otp.save();

    const userName = validEmailUser ? validEmailUser.name.first : "User";
    await sendOtpEmail(email, userName, OTP);

    return {
      ok: true,
      msg: validEmailUser ? "Email sent to existing user" : "Email sent to new user",
    };
  } catch (error) {
    console.error("Error in sending OTP for verification:", error);
    return {
      ok: false,
      msg: error.message,
    };
  }
};







