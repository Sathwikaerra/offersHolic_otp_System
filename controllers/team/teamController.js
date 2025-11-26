import User from "../../models/User.js";
import { getUserIdFromToken } from "../../utils/helpers/helpers.js";


// Invite a new team member
export const inviteTeamMember = async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;
    const userId = getUserIdFromToken(req);

    const inviter = await User.findById(userId)

    // Check if the inviter is a Super Admin or Admin
    if (inviter.profile.profileType !== 'SuperAdmin') {
      return res.status(403).json({ msg: "Access denied" });
    }

    // Send the invite link via email
    //   await emailLinkInvite(email, phoneNumber);

    res.status(200).json({ msg: "Invite sent successfully" });
  } catch (error) {
    console.error("Error inviting team member:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

// Add a new team member
export const addTeamMember = async (req, res) => {
  try {
    const { email, phoneNumber, firstName, lastName } = req.body;
    const userId = getUserIdFromToken(req);

    const inviter = await User.findById(userId);

    // Check if the inviter is a Super Admin or Admin
    if (inviter.profile.profileType !== 'SuperAdmin') {
      return res.status(403).json({ msg: "Access denied" });
    }

    // Check if the user already exists
    let existingEmail = await User.findOne({ "email": email });
    let existingPhone = await User.findOne({ "mobileNumber": phoneNumber });


    if (existingEmail) {
      return res.status(409).json({ msg: "Email already exists" });
    }

    if (existingPhone) {
      return res.status(409).json({ msg: "Phone number already exists" });
    }

    // Create the user
    const newUser = new User({
      email: email,
      mobileNumber: phoneNumber,
      name: { first: firstName, last: lastName },
      profile: { profileType: 'Admin' },

      status: 'accepted',
    });

    const savedUser = await newUser.save();
    //   await emailLinkInvite(email, phoneNumber);

    res.status(201).json({ msg: "Team member added successfully" });
  } catch (error) {
    console.error("Error adding team member:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

// List team members
export const listTeamMembers = async (req, res) => {
  try {
    const teamMembers = await User.find({ "profile.profileType": { $in: ['Admin', 'SuperAdmin'] } });

    res.status(200).json({
      ok: true,
      data: teamMembers,
      count: teamMembers.length,
    });
  } catch (error) {
    console.error("Error listing team members:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

// Get a team member by ID
export const getTeamMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    const teamMember = await User.findById(id);

    res.status(200).json({ teamMember });
  }
  catch (error) {
    console.error("Error getting team member by ID:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};


// Edit a team member
export const editTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, phoneNumber, firstName, lastName } = req.body;
    const userId = getUserIdFromToken(req);

    const inviter = await User.findById(userId);


    // Check if the inviter is a Super Admin or Admin
    if (inviter?.profile?.profileType !== 'SuperAdmin') {
      return res.status(403).json({ msg: "Access denied" });
    }

    // Find and update the user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        email: email,
        mobileNumber: phoneNumber,
        name: { first: firstName, last: lastName },
      },
      { new: true }
    );

    res.status(200).json({ msg: "Team member updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error editing team member:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

// Delete a team member
export const deleteTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserIdFromToken(req);

    const inviter = await User.findById(userId);

    // Check if the inviter is a Super Admin or Admin
    if (inviter.profile.profileType !== 'SuperAdmin') {
      return res.status(403).json({ msg: "Access denied" });
    }

    // Find and delete the user
    await User.findByIdAndDelete(id);


    res.status(200).json({ msg: "Team member deleted successfully" });
  } catch (error) {
    console.error("Error deleting team member:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};