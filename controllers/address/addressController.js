import { getUserIdFromToken } from "../../middlewares/auth/authMiddleware.js";
import Address from "../../models/Address.js";
import BusinessProfile from "../../models/BusinessProfile.js";
import Offer from "../../models/Offer.js";
import User from "../../models/User.js";
import { getUserFromToken } from "../user/userController.js";



// Controller to create a new address
export const createAddress = async (req, res) => {
    try {
        const userId = getUserIdFromToken(req);
        const { addressName, addressType, addressLine1, addressLine2, landmark, city, state, country, pincode, coordinates } = req.body;
        console.log(coordinates)
        const newAddress = new Address({ 
            addressName,
            addressType,
            addressLine1,
            addressLine2,
            landmark,
            city,
            state,
            country:"India",
            pincode,
            coordinates,
        });

        const savedAddress = await newAddress.save();

        const user = await User.findById(userId);
        user.address.push(savedAddress._id);

        await user.save();

        res.status(201).json(savedAddress);
    } catch (error) {
        console.error('Error creating address:', error);
        res.status(500).json({ msg: 'Internal Server Error' });
    }
};

// Controller to update an address by ID
export const updateAddressById = async (req, res) => {
    try {
        const { id } = req.params;


        const { addressType,addressName, addressLine1, addressLine2, landmark, city, state, country, pincode, coordinates } = req.body;


        const updatedAddress = await Address.findByIdAndUpdate(
            id,
            { addressName, addressType, addressLine1, addressLine2, landmark, city, state, country, pincode, coordinates },
            { new: true }
        );




        if (!updatedAddress) {
            return res.status(404).json({ msg: 'Address not found' });
        }

        res.status(200).json(updatedAddress);
    } catch (error) {
        console.error('Error updating address:', error);
        res.status(500).json({ msg: 'Internal Server Error' });
    }
};

// Controller to get an address by ID
export const getAddressById = async (req, res) => {
    try {
        const { id } = req.params;

        const address = await Address.findById(id);

        if (!address) {
            return res.status(404).json({ msg: 'Address not found' });
        }

        res.json(address);
    } catch (error) {
        console.error('Error getting address:', error);
        res.status(500).json({ msg: 'Internal Server Error' });
    }
};


// Controller to get all address 
export const getAllAddress = async (req, res) => {
    try {

        const address = await Address.find();

        if (!address) {
            return res.status(404).json({ msg: 'Address not found' });
        }

        res.json({
            ok: true,
            count: address.length,
            data: address
        });
    } catch (error) {
        console.error('Error getting address:', error);
        res.status(500).json({ msg: 'Internal Server Error' });
    }
};
// Controller to delete an address by ID
export const deleteAddressById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = getUserIdFromToken(req);

        const deletedAddress = await Address.findByIdAndDelete(id);

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        if (!deletedAddress) {
            return res.status(404).json({ msg: 'Address not found' });
        }

        if (deletedAddress) {

            user.address = user.address.filter(address => address?.toString() !== id)

            user.save();

            const businessProfiles = await BusinessProfile.find({ location: id });

            businessProfiles.forEach(async businessProfile => {
                businessProfile.location = null;
                await businessProfile.save();
            }
            );
        }





        res.status(200).json({ msg: 'Address deleted successfully' });
    } catch (error) {
        console.error('Error deleting address:', error);
        res.status(500).json({ msg: 'Internal Server Error' });
    }
};

// Controller to get all saved offers for current user
export const getSavedOffers = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    console.log(userId);

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Safely handle if savedOffers is null/undefined
    const savedOffers = Array.isArray(user.savedOffers) ? user.savedOffers : [];

    const savedOffersData = await Promise.all(
      savedOffers.map(async (offer) => {
        return await Offer.findById(offer)
          .populate({
            path: "businessProfile",
            populate: {
              path: "location", // Populate the 'location' field from 'businessProfile'
            },
          })
          .populate("category");
      })
    );

    // Filter out null offers in case some Offer documents were deleted
    const filteredOffers = savedOffersData.filter((offer) => offer !== null);

    return res.json({
      ok: true,
      count: filteredOffers.length,
      data: filteredOffers,
    });
  } catch (error) {
    console.error("Error getting saved offers:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const getCurrentUserAddresses = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);

    if (!userId) {
      return res.status(401).json({ ok: false, message: "Unauthorized: Invalid token" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ ok: false, message: "User not found" });
    }

    // Ensure addresses exist
    const addresses = Array.isArray(user.address) ? user.address : [];

    if (addresses.length === 0) {
      return res.json({ ok: true, count: 0, data: [] });
    }

    // Fetch addresses, skipping null ones
    const addressesData = (
      await Promise.all(
        addresses.map(async (addressId) => {
          try {
            return await Address.findById(addressId);
          } catch (err) {
            console.warn(`Failed to fetch address ${addressId}:`, err.message);
            return null; // skip broken
          }
        })
      )
    ).filter(Boolean); // remove nulls

    return res.json({
      ok: true,
      count: addressesData.length,
      data: addressesData,
    });
  } catch (error) {
    console.error("Error getting addresses:", error);
    res.status(500).json({ ok: false, message: "Internal Server Error" });
  }
};
