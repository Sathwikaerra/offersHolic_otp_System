import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    categoryImgUrl: {
      type: String,
      required: true,
    },
    
    //for sub  category
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    childrenCategories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model('Category', categorySchema);

export default Category;
