import Address from '../../models/Address.js';
import BusinessProfile from '../../models/BusinessProfile.js';
import Category from '../../models/Category.js';
import Notification from '../../models/Notification.js';
import Offer from '../../models/Offer.js';
import User from '../../models/User.js';
import { getUserIdFromToken } from '../../utils/helpers/helpers.js';


// Controller to create a new offer
export const createOffer = async (req, res) => {
  try {

    const { title, description,videos, category, offerReel, featuredImage, gallery, offerType, offerValue, offerExpiryDate, offerDetails, businessProfile } = req.body;

    // console.log(title)
    // console.log(businessProfile)

    //add image to offer later
    // Check if the business profile exists
    const existingBusinessProfile = await BusinessProfile.findById(businessProfile);
    if (!existingBusinessProfile) {
      return res.status(404).json({ message: 'Business Profile not found' });
    }

    const existingCategory = await Category.findById(category);
    if (!category) {
      return res.status(404).json({ message: 'Category is required' });
    }
    if (!existingCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }


    // Create a new offer
    const newOffer = new Offer({
      title,
      description,
      businessProfile,
      offerType,
      offerValue,
      category,
      featuredImage,
      offerExpiryDate,
      gallery,
      videos,
      offerReel,
      offerDetails,
      
    });

    // Save the offer
    const savedOffer = await newOffer.save();

    // Update business profile with the new offer
    await BusinessProfile.findByIdAndUpdate(
      businessProfile,
      { $push: { offers: savedOffer._id } }, // Assuming you track offers in the business profile
      { new: true }
    );

    res.status(201).json(savedOffer);
  } catch (error) {
    console.error('Error creating offer:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Controller to update an offer
export const updateOffer = async (req, res) => {
  try {
    console.log('ented update royte')
    const { id } = req.params;
    
   
    console.log(id);
    //update the offer status to pending review
    // req.body.status = 'pending review';

    const updatedOffer = await Offer.findByIdAndUpdate(id, req.body, { new: true });

    console.log(updateOffer)

    if (!updatedOffer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    res.status(200).json(updatedOffer);
  } catch (error) {
    console.error('Error updating offer:', error);
    res.status(500).json({ message: 'Internal  Error' });
  }
};

// Update offer status
export const updateOfferStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const offer = await Offer.findById(id);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    console.log("offer found")
    offer.status = status;
    await offer.save();

    res.status(200).json({ message: 'Offer status updated successfully' });
  } catch (error) {
    console.error('Error updating offer status:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Delete an offer by ID
export const deleteOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedOffer = await Offer.findByIdAndDelete(id);

    if (!deletedOffer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    res.status(200).json({ message: 'Offer deleted successfully' });
  } catch (error) {
    console.error('Error deleting offer:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Increment offer clicks
export const incrementOfferClicks = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserIdFromToken(req);

    console.log(userId);
    console.log(id);

    const offer = await Offer.findById(id);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    const userClick = offer.clicks.find(click => click.userId.toString() === userId);
    if (userClick) {
      userClick.count += 1;
    } else {
      offer.clicks.push({ userId, count: 1 });
    }

    // const userClick = offer.clicks.userId.find(click => click.userId === userId);

    // if (userClick) {
    //   userClick.count += 1;
    // } else {
    //   offer.clicks.userId.push({ userId });
    //   offer.clicks.count += 1;
    // }

    await offer.save();

    res.status(200).json({ message: 'Clicks incremented successfully' });
  } catch (error) {
    console.error('Error incrementing clicks:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Increment offer views
export const incrementOfferViews = async (req, res) => {
  try {
    const { id } = req.params; // offerId

    const userId = req.user.id;
    // make sure user is authenticated (JWT or session)

    const offer = await Offer.findById(id);
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }
    console.log('checking for the user')

    // Check if user already viewed
    if (!offer.viewedBy.includes(userId)) {
      offer.views += 1;
      offer.viewedBy.push(userId);
      await offer.save();
       console.log('view  counted user viewd this  before')
      return res.status(200).json({ message: "View counted" });
    }

    console.log('view not counted no user viewd this  before')


    res.status(200).json({ message: "User already viewed" });
  } catch (error) {
    console.error("Error incrementing views:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



//  Controller Get all offers
export const getAllOffers = async (req, res) => {
  try {
    await Offer.updateMany(
  { offerExpiryDate: { $lt: new Date() } },
  { $set: { status: "expired", active: false } }
);
    const offers = await Offer.find().populate({
      path: 'businessProfile',
      populate: {
        path: 'location', // Populate the 'location' field from 'businessProfile'
      },
    })
      .populate('category')
      .populate('clicks.userId')
    res.status(200).json({
      ok: true,
      count: offers.length,
      data: offers,
    });
  } catch (error) {
    console.error('Error fetching offers:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get offer by ID
export const getOfferById = async (req, res) => {
  try {
    const { id } = req.params;
    const offer = await Offer.findById(id).populate({
      path: 'businessProfile',
      populate: [
          { path: "location" }, // populate location
           // 👈 populate users inside followers
        ],
    }).populate('category')
      
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }
    console.log('offer fetched')
    res.status(200).json(offer);
  } catch (error) {
    console.error('Error fetching offer:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get all offers by business profile ID
export const getAllOffersByBusinessProfileId = async (req, res) => {
  try {
    const { businessProfileId } = req.params;
    const businessProfile = await BusinessProfile.findById(businessProfileId);

    if (!businessProfile) {
      return res.status(404).json({ message: 'Business Profile not found' });
    }

    const offers = await Offer.find({ businessProfile: businessProfileId }).populate(
      { path: 'businessProfile', populate: { path: 'location' } }
    ).populate('clicks.userId');

    //sort latest offers first
    const sortedOffer = offers.sort((a, b) => {
      return b.createdAt - a.createdAt;
    });


    if (!sortedOffer) {
      return res.status(404).json({ message: 'Offers not found' });
    }

    res.status(200).json({
      ok: true,
      businessProfile: businessProfile,
      count: sortedOffer.length,
      data: sortedOffer,
    });
  } catch (error) {
    console.error('Error fetching offers:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get offers pending review
export const getOffersPendingReview = async (req, res) => {
  try {
    const offers = await Offer.find({ status: 'pending review' }).populate('businessProfile');
    res.status(200).json({
      ok: true,
      count: offers.length,
      data: offers,
    });
  } catch (error) {
    console.error('Error fetching pending review offers:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get approved offers
export const getOffersApproved = async (req, res) => {
  try {
    const offers = await Offer.find({ status: 'approved' }).populate('businessProfile');
    res.status(200).json({
      ok: true,
      count: offers.length,
      data: offers,
    });
  } catch (error) {
    console.error('Error fetching approved offers:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get active offers
export const getOffersActive = async (req, res) => {
  try {
    const offers = await Offer.find({ status: 'active' }).populate('businessProfile');
    res.status(200).json({
      ok: true,
      count: offers.length,
      data: offers,
    });
  } catch (error) {
    console.error('Error fetching active offers:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get inactive offers
export const getOffersInactive = async (req, res) => {
  try {
    const offers = await Offer.find({ status: 'inactive' }).populate('businessProfile');
    res.status(200).json({
      ok: true,
      count: offers.length,
      data: offers,
    });
  } catch (error) {
    console.error('Error fetching inactive offers:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get rejected offers
export const getOffersRejected = async (req, res) => {
  try {
    const offers = await Offer.find({ status: 'rejected' }).populate('businessProfile');
    res.status(200).json({
      ok: true,
      count: offers.length,
      data: offers,
    });
  } catch (error) {
    console.error('Error fetching rejected offers:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// List offers with search and filter functionality
export const listOffers = async (req, res) => {
  try {
    const { search, status, businessProfile, sortBy } = req.query;

    const filter = {};

    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    if (status) {
      filter.status = status;
    }

    if (businessProfile) {
      filter.businessProfile = businessProfile;
    }




    const offers = await Offer.find(filter).populate('businessProfile').populate('category');

    if (sortBy) {
      offers.sort((a, b) => {
        if (sortBy === 'views') {
          return b.views - a.views;
        }
        if (sortBy === 'clicks') {
          return a.clicks - b.clicks;
        }
        if (sortBy === 'expiry') {
          return a.offerExpiryDate - b.offerExpiryDate;
        }
        if (sortBy === 'createdAt') {
          return a.createdAt - b.createdAt;
        }

      });
    }

    return res.status(200).json({
      ok: true,
      count: offers.length,
      data: offers,
    });


  } catch (error) {
    console.error('Error listing offers:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// List offers with clarification requested
export const getCurrentUserClarificationOffers = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    console.log(userId);

    // Find all offers requiring clarification for the user's business profiles
    const offers = await Offer.find({ status: 'clarification required' })
      .populate({
        path: 'businessProfile',
        match: { user: userId }, // Ensures that the offers belong to the user's business profiles
      })

    const businessProfile = await BusinessProfile.find({ User: userId })



    if (!businessProfile) {
      return res.status(404).json({ message: 'No business profiles found for this user' });
    }
    //latest offers first
    const businessOffers = await Offer.find({
      businessProfile: { $in: businessProfile.map(profile => profile._id) }, status: 'clarification required',
      // latest offers should be sorted first 
    }).sort({
      createdAt: -1
    }).populate('businessProfile').populate('category');

    console.log(businessOffers);

    res.status(200).json({
      ok: true,
      count: businessOffers.length,
      data: businessOffers
    });
  } catch (error) {
    console.error('Error fetching user clarification offers:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

//get nearby offers
export const getNearbyOffers = async (req, res) => {
  try {
    const { lat, long, maxDistance = 18000 } = req.query;
    console.log(lat, long, maxDistance);
    if (!lat || !long) {
      return res.status(400).json({ message: 'Latitude and longitude are required.' });
    }

    // Find the nearest location first
    const nearbyLocations = await Address.find({
      coordinates: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(long), parseFloat(lat)],
          },
          $maxDistance: parseInt(maxDistance),
        },
      },
    }).select('_id');

    console.log(nearbyLocations);

    if (!nearbyLocations) {
      return res.status(404).json({ message: 'No nearby locations found.' });
    }

    // Find the associated business profile with the nearest location
    const nearbyBusinesses = await BusinessProfile.find({
      location: { $in: nearbyLocations.map(location => location._id) },
    });

    // console.log(nearbyBusinesses);

    if (!nearbyBusinesses) {
      return res.status(404).json({ message: 'No nearby businesses found.' });
    }

    // Find the offer associated with the nearest business profile
    const nearbyOffers = await Offer.find({
      businessProfile: { $in: nearbyBusinesses.map(business => business._id) },
      status: 'active',
    }).populate({
      path: 'businessProfile',
      populate: { path: 'location' },
    }).populate('category');



    if (!nearbyOffers) {
      return res.status(200).json({ message: 'No nearby offers found' });
    }
    console.log(nearbyOffers)

    res.status(200).json({
      ok: true,
      data: nearbyOffers,
      count: nearbyOffers.length,
    });
  } catch (error) {
    console.error('Error fetching nearest offer:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

//ask clarification of offer
export const askClarification = async (req, res) => {
  try {
    const { id } = req.params;
    const { clarification } = req.body;

    if (!clarification) {
      return res.status(400).json({ message: 'Clarification message is required' });
    }

    //validate 200 characters
    if (clarification.length > 200) {
      return res.status(400).json({ message: 'Clarification message must not exceed 200 characters' });
    }

    const offer = await Offer.findById(id)
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }


    offer.status = 'clarification required';
    offer.clarificationMessage = clarification;
    await offer.save();
    console.log(offer);
    // find business profile id in business.businessProfiles array 

    const businessProfile = await BusinessProfile.findById(offer.businessProfile);

    const userToSendNotification = businessProfile.User;

    const notification = new Notification({
      recipient: userToSendNotification,
      type: 'Clarification',
      message: `Your offer ${offer.title} requires clarification`,
      clarificationMessage: clarification,
    });

    await notification.save();

    res.status(200).json({ message: 'Clarification requested successfully' });

  } catch (error) {
    console.error('Error requesting clarification:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

//submit or answer clarification of offers
export const submitClarification = async (req, res) => {
  try {
    const { id } = req.params;
    const { clarification } = req.body;
    console.log(clarification);
    if (!clarification) {
      return res.status(400).json({ message: 'Clarification message is required' });
    }

    //validate 200 characters
    if (clarification.length > 200) {
      return res.status(400).json({ message: 'Clarification message must not exceed 200 characters' });
    }

    const offer = await Offer.findById(id)
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    offer.status = 'clarification submitted';
    offer.clarificationAnswer = clarification;
    await offer.save();

    res.status(200).json({ message: 'Clarification submitted successfully' });

  } catch (error) {
    console.error('Error submitting clarification:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

//get offers by category
export const getOffersByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
   
    const businessCategory = await Category.findOne({ _id: categoryId })
    if (!businessCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const offers = await Offer.find({ category: categoryId, status: 'active' }).populate(
      { path: 'businessProfile', populate: { path: 'location' } }
    )

    console.log(offers);



    res.status(200).json({
      ok: true,
      count: offers.length,
      data: offers,
    });
  }
  catch (error) {
    console.error('Error fetching offers by category:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

//get trending offers˝
export const getTrendingOffers = async (req, res) => {
  try {

    console.log('offers trending')

    const offersCHECK = await Offer.find();
    for (const offer of offersCHECK) {
  offer.checkExpiry(); // auto update status if expired
  await offer.save();  // persist changes
}
    const offers = await Offer.find({
      status: 'active',
    }).sort({ views: -1, clicks: -1 })
      .populate({
        path: 'businessProfile',
        populate: {
          path: 'location', // Populate the 'location' field from 'businessProfile'
        },
      })
      .populate('category')

      console.log(offers);
    res.status(200).json({
      ok: true,
      count: offers.length,
      data: offers,
    });
  } catch (error) {
    console.error('Error fetching trending offers:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

//toggle offer save
export const toggleOfferSave = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserIdFromToken(req);

    const offer = await Offer.findById(id);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const savedOffer = user.savedOffers.find(offer => offer.toString() === id);

    if (savedOffer) {
      user.savedOffers = user.savedOffers.filter(offer => offer.toString() !== id);
    }

    else {
      user.savedOffers.push(id);
    }

    await user.save();

    if (savedOffer) {
      return res.status(200).json({ message: 'Offer removed from saved offers' });
    }

    res.status(200).json({ message: 'Offer saved successfully' });

  } catch (error) {

    console.error('Error saving offer:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}