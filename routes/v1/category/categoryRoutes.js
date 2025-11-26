import express from 'express';
import { createCategory, deleteCategory, editCategory, getCategory, listCategories } from '../../../controllers/category/categoryController.js';
import { authenticateAdmin, authenticateToken } from '../../../middlewares/auth/authMiddleware.js';

const router = express.Router();


// Create a new category
router.post("/create", authenticateAdmin, createCategory);

// List all categories
router.get("/all", authenticateToken, listCategories);

// Get a single category by ID
router.get("/category/:id", authenticateToken, getCategory);

// Edit a category
router.put("/category/:id", authenticateAdmin, editCategory);

// Delete a category
router.delete("/category/:id", authenticateAdmin, deleteCategory);

export default router;
