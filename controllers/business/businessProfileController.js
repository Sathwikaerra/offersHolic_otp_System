import Address from '../../models/Address.js';
import BusinessProfile from '../../models/BusinessProfile.js';
import User from '../../models/User.js';
import { getUserIdFromToken } from '../../utils/helpers/helpers.js';
import { getInfo, isValidGSTNumber } from '@scrrum-labs/gst-india-utils';
import axios from 'axios';

// Function to call the primary GST validation APIimport axios from "axios";

// Primary GST API via RapidAPIconst axios = require("axios");

// ✅ Primary API (RapidAPI - POST request)import axios from "axios";

// ✅ Primary API (gst-verification - POST)
async function validateGSTWithPrimaryAPI(GSTIN) {
  const options = {
    method: "POST",
    url: "https://gst-verification.p.rapidapi.com/v3/tasks/sync/verify_with_source/ind_gst_certificate",
    headers: {
      "x-rapidapi-key": process.env.RAPID_GST_VERIFICATION_API_KEY, // keep in .env
      "x-rapidapi-host": "gst-verification.p.rapidapi.com",
      "Content-Type": "application/json",
    },
    data: {
      task_id: "74f4c926-250c-43ca-9c53-453e87ceacd1", // generate dynamically if needed
      group_id: "8e16424a-58fc-4ba4-ab20-5bc8e7c3c41e", // optional
      data: { gstin: GSTIN },
    },
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error("Error with Primary API:", error.response?.data || error.message);
    throw new Error("Primary API failed");
  }
}

// ✅ Secondary API (gst-insights-api - GET)
async function validateGSTWithSecondaryAPI(GSTIN) {
  const url = `https://gst-insights-api.p.rapidapi.com/getGSTDetailsUsingGST/${GSTIN}`;

  const options = {
    method: "GET",
    url,
    headers: {
      "x-rapidapi-key": process.env.RAPID_GST_INSIGHTS_API_KEY, // keep in .env
      "x-rapidapi-host": "gst-insights-api.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error("Error with Secondary API:", error.response?.data || error.message);
    throw new Error("Secondary API failed");
  }
}


export const approveBusinessProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const businessProfile = await BusinessProfile.findById(id);
    if (!businessProfile) return res.status(404).json({ msg: 'Business profile not found' });

    businessProfile.status = 'approved';
    await businessProfile.save();

    // Add to user's business list now
    await User.findByIdAndUpdate(
      businessProfile.User,
      { $push: { 'business.businessProfiles': { business: businessProfile._id } } }
    );

    res.status(200).json({ msg: 'Business profile approved and added to user', businessProfile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Internal Server Error' });
  }
};



// Create a new Business Profile with Address 
export const createBusinessProfile = async (req, res) => {
  try {
    const { name, description, category, proofImage, GSTIN, logo, businessPictureGallery, website, phoneNumber, email, socialMedia, addressId, addressDetails } = req.body;
    const owner = getUserIdFromToken(req);

    console.log(req.body)

    // Check that either GSTIN or proofImage is provided
    if (!GSTIN && !proofImage) {
      return res.status(401).json({ msg: 'GSTIN or image is required' });
    }

    let locationAddress = null;

    // Handle address (either existing or create new)
    if (addressId) {
      locationAddress = await Address.findById(addressId);
      if (!locationAddress) {
        return res.status(404).json({ msg: 'Address not found' });
      }
    } else if (addressDetails) {
      const { addressName, addressType, addressLine1, addressLine2, landmark, city, state, country, pincode, coordinates } = addressDetails;

      const newAddress = new Address({
        addressName,
        addressType,
        addressLine1,
        addressLine2,
        landmark,
        city,
        state,
        country,
        pincode,
        coordinates,
      });

      locationAddress = await newAddress.save();

      const user = await User.findById(owner);
      user.address.push(locationAddress._id);

      await user.save();
    }

    // Create the business profile but mark it as "pending approval"
    const newBusinessProfile = new BusinessProfile({
      name,
      description,
      category,
      location: locationAddress ? locationAddress._id : null,
      logo,
      businessPictureGallery,
      website,
      phoneNumber,
      email,
      GSTIN,
      ProfileImage: proofImage,
      socialMedia,
      User: owner,
      status: 'pending', // <-- NEW: mark as pending
    });

    const savedBusinessProfile = await newBusinessProfile.save();

    // Do NOT push to user's business list yet — wait for admin approval

    res.status(201).json({
      msg: 'Business Profile created successfully. Awaiting admin approval.',
      businessProfile: savedBusinessProfile,
    });
  } catch (error) {
    console.error('Error creating business profile:', error);
    res.status(500).json({ msg: 'Internal Server Error' });
  }
};

// Controller to get BusinessProfile by ID and deeply populate related fields
export const getBusinessProfileById = async (req, res) => {
  try {
    const profileId = req.params.id;

    // Find BusinessProfile and populate related fields
    const businessProfile = await BusinessProfile.findById(profileId)
      .populate('name email')
      .populate('category')
      .populate('location')
      .populate('offers')
      // .populate({
      //   path: 'ads',
      //   populate: {
      //     path: 'adType.typeRef',
      //     model: (doc) => {
      //       return doc.adType.type === 'Offer' ? 'Offer' : 'Coupon';
      //     },
      //   },
      // })


    if (!businessProfile) {
      return res.status(404).json({ message: 'Business profile not found' });
    }

    res.json(businessProfile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Controller to get All BusinessProfile by User ID and deeply populate related fields
export const getAllBusinessProfileByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId)

    // Find BusinessProfile and populate related fields
    const businessProfile = await BusinessProfile.find({ User: userId })
      .populate('name email')
      .populate('category')
      // .populate({ path: 'ads', populate: { path: 'adType.typeRef' } })
      .populate('location')
      .populate('logo')
    

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }


    if (!businessProfile) {
      return res.status(404).json({ message: 'No business profile found for this user' });
    }

    res.json({
      ok: true,
      user: user,
      businessProfiles: businessProfile
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Controller to get All BusinessProfile by Current User ID and deeply populate related fields
export const getAllCurrentUserBusinessProfile = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);

    if (!userId) {
      return res.status(401).json({ ok: false, message: "Unauthorized: Invalid token" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ ok: false, message: "User not found" });
    }

    console.log("User email:", user.email);

    // Fetch all business profiles for the user
   const businessProfiles = await BusinessProfile.find({
  User: userId,
  status: { $regex: /^active$/i },
})
.populate("category")
.populate("location");

      // .populate({ path: "ads", populate: { path: "adType.typeRef" } });

  if (!businessProfiles || businessProfiles.length === 0) {
  return res.json({
    ok: true,
    empty: true,
    user,
    count: 0,
    businessProfiles: []
  });
}


    return res.json({
      ok: true,
      user,
      count: businessProfiles.length,
      businessProfiles,
    });
  } catch (err) {
    console.error("Error fetching business profiles:", err);
    return res.status(500).json({ ok: false, message: "Internal Server Error" });
  }
};

// Controller to get All BusinessProfile   and deeply populate related fields
export const getAllBusinessProfile = async (req, res) => {
  try {
    // Find BusinessProfile and populate related fields
    const businessProfile = await BusinessProfile.find()
      .populate('User')
      .populate('category')
      // .populate({
      //   path: 'ads',
      //   populate: {
      //     path: 'adType.typeRef',
      //     model: (doc) => {
      //       return doc.adType.type === 'Offer' ? 'Offer' : 'Coupon';
      //     },
      //   },
      // })
      .populate('location')


    if (!businessProfile) {
      return res.status(404).json({ message: 'Business profile not found' });
    }

    res.json({
      ok: true,
      data: businessProfile,
      totalCount: businessProfile.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// Edit a Business Profile
export const editBusinessProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, location, logo, businessPictureGallery, website, phoneNumber, email, socialMedia } = req.body;

    const updatedBusinessProfile = await BusinessProfile.findByIdAndUpdate(
      id,
      { name, description, category, location, logo, businessPictureGallery, website, phoneNumber, email, socialMedia },
      { new: true }
    );

    if (!updatedBusinessProfile) {
      return res.status(404).json({ msg: "Business Profile not found" });
    }

    res.status(200).json(updatedBusinessProfile);
  } catch (error) {
    console.error("Error editing business profile:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

// Delete a Business Profile
export const deleteBusinessProfile = async (req, res) => {
  try {
    const { id } = req.params;

    // Remove the business profile from individual user's profile
    const deletedBusinessProfile = await BusinessProfile.findByIdAndDelete(id);
    if (!deletedBusinessProfile) {
      return res.status(404).json({ msg: 'Business Profile not found' });
    }

    const owner = getUserIdFromToken(req);
    await User.findOneAndUpdate(
      { user: owner },
      { $pull: { 'business.businessProfiles': { business: id } } },
      { new: true }
    );

    res.status(200).json({ msg: 'Business Profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting business profile:', error);
    res.status(500).json({ msg: 'Internal Server Error' });
  }
};

// Activate or Deactivate Business Profile
export const toggleBusinessProfileActivation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserIdFromToken(req);

    // Check if the BusinessProfile exists
    const businessProfile = await BusinessProfile.findById(id);
    if (!businessProfile) {
      return res.status(404).json({ msg: 'Business Profile not found' });
    }

    // Check if the user has permission to manage this BusinessProfile
    const individualUser = await IndividualUser.findOne({ user: userId, 'business.businessProfiles.business': id });
    if (!individualUser) {
      return res.status(403).json({ msg: 'Unauthorized access' });
    }

    // Update business profile's active status
    businessProfile.active = !businessProfile.active;
    await businessProfile.save();

    // Update individual user's business profiles' active status
    const index = individualUser.business.businessProfiles.findIndex(bp => bp.business.equals(id));
    individualUser.business.businessProfiles[index].active = businessProfile.active;
    await individualUser.save();

    res.status(200).json({ msg: 'Business Profile activation status updated successfully', businessProfile });
  } catch (error) {
    console.error('Error toggling business profile activation:', error);
    res.status(500).json({ msg: 'Internal Server Error' });
  }
};

// Increment followers count
export const incrementFollowersCount = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserIdFromToken(req);

    // Check if the BusinessProfile exists
    const businessProfile = await BusinessProfile.findById(id);
    if (!businessProfile) {
      return res.status(404).json({ msg: 'Business Profile not found' });
    }

    // Initialize the followers and count if they don't exist
    if (!businessProfile.followers) {
      businessProfile.followers = { followers: [], count: 0 };
    }

    // Check if the user is already following the business
    const isFollowing = businessProfile.followers.followers.includes(userId);

    if (isFollowing) {
      // If the user is already following, use Mongoose's `pull` method to remove them
      businessProfile.followers.followers.pull(userId);
      businessProfile.followers.count = Math.max(0, businessProfile.followers.count - 1); // Prevent negative count
      await businessProfile.save();
      return res.status(200).json({ msg: 'Unfollowed successfully', businessProfile });
    } else {
      // If the user is not following, use Mongoose's `push` method to add them
      businessProfile.followers.followers.push(userId);
      businessProfile.followers.count += 1;
      await businessProfile.save();
      return res.status(200).json({ msg: 'Followed successfully', businessProfile });
    }
  } catch (error) {
    console.error('Error incrementing followers count:', error);
    res.status(500).json({ msg: 'Internal Server Error' });
  }
};



    

