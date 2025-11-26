import cron from 'node-cron';
import Offer from '../../models/Offer.js';

//create a crom job that sets the status of all offers to expired if expired and the expiry date is less than the current date

export const setOffersToExpired = cron.schedule('0 0 * * *', async () => {
    try {
      console.log('running cron job to set offers to expired');
        const currentDate = new Date();
        const offers = await Offer.find({ offerExpiryDate: { $lt: currentDate } });
        await Promise.all(
          offers.map(async (offer) => {
            offer.status = 'expired';
            return offer.save();
          })
        );
        
    } catch (error) {
        console.error('Error setting offers to expired:', error);
    }
});

//start the cron job
setOffersToExpired.start();

export default setOffersToExpired;
