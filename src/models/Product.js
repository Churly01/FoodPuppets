const mongoose = require('mongoose');

const macronutrients_schema = new mongoose.Schema({
  cho: {
    type: Number,
    required: true
  },
  fat: {
    type: Number,
    required: true
  },
  protein:
  {
    type: Number,
    required: true
  },
  kcal: {
    type: Number
  },
});


const product_schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  macronutrients: {
    type: macronutrients_schema,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  weight: Number,
  description: String,
  price_per_kg: Number,
  url: String,
  created_at: {
    type: Date,
    default: Date.now
  },
});

const Product = mongoose.model('Product', product_schema);
module.exports = Product;
