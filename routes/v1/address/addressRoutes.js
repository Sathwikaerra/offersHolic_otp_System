import express from 'express';
import { createAddress, deleteAddressById, getAddressById, getAllAddress, getCurrentUserAddresses, updateAddressById } from '../../../controllers/address/addressController';

const router = express.Router();

// Route to create a new address
router.post('/create', createAddress);

// Route to update an address by ID
router.put('/:id', updateAddressById);

// Route to get an address by ID
router.get('/:id', getAddressById);

// Route to get all address 
router.get('/all', getAllAddress);

//Route to get all current user address
router.get('/get/current', getCurrentUserAddresses);


// Route to delete an address by ID
router.delete('/:id', deleteAddressById);

export default router;
