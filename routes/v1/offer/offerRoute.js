import express from 'express';
import { askClarification, createOffer, deleteOffer, getAllOffers, getAllOffersByBusinessProfileId, getCurrentUserClarificationOffers, getNearbyOffers, getOfferById, getOffersActive, getOffersApproved, getOffersByCategory, getOffersInactive, getOffersPendingReview, getOffersRejected, getTrendingOffers, incrementOfferClicks, incrementOfferViews, listOffers, submitClarification, toggleOfferSave, updateOffer, updateOfferStatus } from '../../../controllers/offer/offerController.js';
import { authenticateAdmin, authenticateToken } from '../../../middlewares/auth/authMiddleware.js';
import Offer from '../../../models/Offer.js'
import Notification from '../../../models/Notification.js'


const router = express.Router();

router.patch('/approve/:id', async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate('businessProfile'); // assuming offer has owner field referencing User
    if (!offer) return res.status(404).json({ message: 'Offer not found' });

    offer.status = 'active';
    await offer.save();

    // Create notification for the owner
    await Notification.create({
      recipient: offer.businessProfile.User,
      type: 'AdApproved',
      message: `Your offer "${offer.title}" has been approved.`,
    });

    res.status(200).json({ message: 'Offer approved', offer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Reject Offer
router.patch('/reject/:id', async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate('businessProfile');
    if (!offer) return res.status(404).json({ message: 'Offer not found' });

    offer.status = 'rejected';
    await offer.save();

    // Create notification for the owner
    await Notification.create({
       recipient: offer.businessProfile.User,
      type: 'Clarification',
      clarificationMessage: req.body.reason || 'Your offer was rejected.',
      message: `Your offer "${offer.title}" has been rejected.`,
    });

    res.status(200).json({ message: 'Offer rejected', offer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


//------------------------- POST REQUESTS -------------------------

// POST create a new offer
router.post('/create', authenticateToken, createOffer);



//--------------------------- PUT REQUESTS ---------------------------

// PUT update an offer
router.patch('/:id', authenticateToken, updateOffer);


//------------------------- DELETE REQUESTS -------------------------

// DELETE delete an offer
router.delete('/:id', authenticateToken, deleteOffer);


//------------------------- PATCH REQUESTS -------------------------

// PATCH update offer status
router.patch('/:id/update-status', authenticateAdmin, updateOfferStatus);

// PATCH increment offer clicks
router.patch('/:id/increment-clicks', authenticateToken, incrementOfferClicks);

// PATCH increment offer views
router.patch('/:id/increment-views', authenticateToken, incrementOfferViews);

// PATCH ask for clarification
router.patch('/:id/ask-clarification', authenticateAdmin, askClarification);

// PATCH submit clarification answer
router.patch('/:id/submit-clarification', authenticateToken, submitClarification);

//------------------------- GET REQUESTS -------------------------

// Get all Offers and populate related fields
router.get('/get/all', authenticateToken, getAllOffers);

// GET list offers with search and filter
router.get('/get/all/filtered', authenticateToken, listOffers); 

// GET list offers with search and filter
router.get('/get/all/clarification-requested', authenticateToken, getCurrentUserClarificationOffers);

// GET offer by ID
router.get('/:id', authenticateToken, getOfferById);

// GET all offers by business profile ID
router.get('/get/all/:businessProfileId', authenticateToken, getAllOffersByBusinessProfileId);


// GET offers pending review
router.get('/get/pending-review', authenticateToken, getOffersPendingReview);

// GET approved offers
router.get('/get/approved', authenticateToken, getOffersApproved);

// GET active offers
router.get('/get/active', authenticateToken, getOffersActive);

// GET inactive offers
router.get('/get/inactive', authenticateToken, getOffersInactive);

// GET rejected offers
router.get('/get/rejected', authenticateToken, getOffersRejected);

// GET rejected offers
router.get('/get/nearby',  getNearbyOffers);

//GET offers by category
router.get('/get/category/:categoryId', authenticateToken, getOffersByCategory);

//GET Trending Offers
router.get('/get/trending', authenticateToken, getTrendingOffers);

//Toggle offer save 
router.patch('/:id/save', authenticateToken, toggleOfferSave);





export default router;
