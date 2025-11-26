import Category from "../../models/Category.js";


// Create a new category
export const createCategory = async (req, res) => {
  try {
    const { name, categoryImgUrl, description, parentCategory } = req.body;

    // Create a new category
    const newCategory = new Category({ name, description,categoryImgUrl, parentCategory });
    const savedCategory = await newCategory.save();

    // If there's a parent category, update its childrenCategories
    if (parentCategory) {
      await Category.findByIdAndUpdate(parentCategory, {
        $push: { childrenCategories: savedCategory._id }
      });
    }

    res.status(201).json(savedCategory);
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

// List all categories
//https://firebasestorage.googleapis.com/v0/b/offersholic-612a0.appspot.com/o/CategoryImages%2Ffeatured%2Fdining-table.png?alt=media&token=602d50bf-b8dd-4acc-ac21-31997d7ea251
export const listCategories = async (req, res) => {
  try {
    console.log("entered categories route")
    const categories = await Category.find().populate('parentCategory childrenCategories');

    console.log(categories)
    res.status(200).json(categories);
    
  } catch (error) {
    console.error("Error listing categories:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

// Get a single category by ID
export const getCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id).populate('parentCategory childrenCategories');

    if (!category) {
      return res.status(404).json({ msg: "Category not found" });
    }

    res.status(200).json(category);
  } catch (error) {
    console.error("Error getting category:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

// Edit a category
export const editCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, parentCategory, categoryImgUrl } = req.body;

    // Update the category
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name, description, parentCategory, categoryImgUrl },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ msg: "Category not found" });
    }

    // If there's a parent category, update its childrenCategories
    if (parentCategory) {
      await Category.findByIdAndUpdate(parentCategory, {
        $addToSet: { childrenCategories: updatedCategory._id }
      });
    }

    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error("Error editing category:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

// Delete a category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return res.status(404).json({ msg: "Category not found" });
    }

    // If there's a parent category, remove the deleted category from its childrenCategories
    if (deletedCategory.parentCategory) {
      await Category.findByIdAndUpdate(deletedCategory.parentCategory, {
        $pull: { childrenCategories: deletedCategory._id }
      });
    }

    res.status(200).json({ msg: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};
