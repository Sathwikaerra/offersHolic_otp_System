import { getUserIdFromToken } from "../../middlewares/auth/authMiddleware.js";

import User from "../../models/User.js";

// Get user from token




export const getUserFromToken = async (req, res) => {
  try {

    console.log('entered 1')
  
    const userId = getUserIdFromToken(req);
    const user = await User.findById(userId);
    console.log(user)
    res.json(user);

  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const query = "User";
    const users = await User.find({ "profile.profileType": query });
    res.json({
      ok: true,
      data: users,
      msg: "All users fetched successfully",
      count: users.length
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all individual users
// export const getAllIndividualUsers = async (req, res) => {
//   try {
//     const users = await IndividualUser.find().populate('user');
//     res.json(users);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// Get all Users
// export const getAllUsers = async (req, res) => {
//   try {
//     const Users = await User.find().populate('user');
//     res.json(Users);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Run subscription check (no await needed)
    console.log("checking subscription")
    user.checkSubscriptions();
    
    console.log("✅✅ subscription check")

    // ✅ Save changes to DB (needs await)
    await user.save();

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params
    // Find user by ID
    const user = await User.findById(id);

    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete the user
    await User.findByIdAndDelete(id);

    // Send success response
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// -------------------update user details-------------------
export const updateUserName = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);

    const { firstName, middleName, lastName } = req.body;

    // Find the user by userId
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Update user's name fields
    if (firstName) {
      user.name.first = firstName;
    }
    if (middleName) {
      user.name.middle = middleName;
    }
    if (lastName) {
      user.name.last = lastName;
    }

    // Save the updated user
    const updatedUser = await user.save();

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

export const updateEmail = async (req, res) => {
  const userId = getUserIdFromToken(req);
  try {
    const { email, otp } = req.body;

    if (!email || !otp || !userId) {
      return res.status(400).send({
        msg: "Email, OTP, and user ID are required",
        ok: false,
      });
    }

    // Verify OTP
    const verificationResult = await verifyotp(req, res);

    if (!verificationResult.ok) {
      return res
        .status(verificationResult.statusCode)
        .json({ msg: verificationResult.msg });
    }
    const user = await User.findOneAndUpdate(
      { _id: userId, verified: true },
      { $set: { "email.id": email.toLowerCase().trim() } },
      { new: true }
    );

    if (!user) {
      return res.status(404).send({
        msg: "User not found",
        ok: false,
      });
    }

    res.status(200).send({
      msg: "Email updated successfully",
      ok: true,
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      msg: "Internal Server Error",
      ok: false,
    });
  }
};

export const updatePhone = async (req, res) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authorizationHeader.split("Bearer ")[1];
  const decodedToken = jwt.verify(token, process.env.JWT_SECRETKEY);
  const userId = decodedToken.id;
  try {
    const { mobileNo, otp, countryCode } = req.body;

    if (!mobileNo || !otp || !countryCode || !userId) {
      return res.status(400).send({
        msg: "Mobile number, OTP, country code, and user ID are required",
        ok: false,
      });
    }

    // Verify OTP
    const verificationResult = await verifyotp(req, res);

    if (!verificationResult.ok) {
      return res
        .status(verificationResult.statusCode)
        .json({ msg: verificationResult.msg });
    }

    const user = await User.findOneAndUpdate(
      { _id: userId, verified: true }, // Update only verified users with matching ID
      {
        $set: {
          "phone.countryCode": countryCode,
          "phone.number": mobileNo.trim(),
        },
      },
      { new: true } // Return the updated user document
    );

    if (!user) {
      return res.status(404).send({
        msg: "User not found",
        ok: false,
      });
    }

    res.status(200).send({
      msg: "Phone number updated successfully",
      ok: true,
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      msg: "Internal Server Error",
      ok: false,
    });
  }
};


export const updateUserData = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);

    const { firstName, middleName, profilePic, lastName, email, mobileNumber } = req.body;

    // Find the user by userId
    const user = await User.findById(userId)


    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Update user's name fields
    if (firstName) {
      user.name.first = firstName;
    }
    if (middleName) {
      user.name.middle = middleName;
    }
    if (lastName) {
      user.name.last = lastName;
    }
    if (email) {
      user.email = email;
    }
    if (mobileNumber) {
      user.mobileNumber = mobileNumber;
    }
    if (profilePic) {
      user.profilePic = profilePic;
    }
    


    // Save the updated user
    const updatedUser = await user.save();

    res.status(200).json(
      {
        ok: true,
        data: updatedUser,
        msg: "User data updated successfully"
      }
    );
  }
  catch (error) {
    res.status(400).json({ msg: error.message });
  }
}

//update user details by admin
export const updateUserDataByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, middleName, lastName, email, mobileNumber } = req.body;

    // Find the user by userId
    const user = await User.findById(id)

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Update user's name fields
    if (firstName) {
      user.name.first = firstName;
    }
    if (middleName) {
      user.name.middle = middleName;
    }
    if (lastName) {
      user.name.last = lastName;
    }
    if (email) {
      user.email = email;
    }
    if (mobileNumber) {
      user.mobileNumber = mobileNumber;
    }

    // Save the updated user
    const updatedUser = await user.save();

    res.status(200).json(
      {
        ok: true,
        data: updatedUser,
        msg: "User data updated successfully"
      }
    );
  }
  catch (error) {
    res.status(400).json({ msg: error.message });
  }
} 


export const savePushToken = async (req, res) => {
  try {
      const userId = getUserIdFromToken(req);
      const { pushToken } = req.body;

      const user = await User.findById(userId);

      user.deviceToken = pushToken;

      await user.save();
      console.log('Push token saved successfully');
      res.status(200).json({ msg: 'Push token saved successfully' });
  } catch (error) {
      console.error('Error saving push token:', error);
      res.status(500).json({ msg: 'Internal Server Error' });
  }
}