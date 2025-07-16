const mongoose = require("mongoose");

// Helper function to format amount with commas
const formatAmount = (amount) => {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Helper function to format date nicely
const formatDate = (date) => {
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

// Helper function to parse amount back to a number
const parsedAmount = (formattedAmount) => {
  return Number(formattedAmount.replace(/[^0-9.-]+/g, ""))
} 

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['deposit', 'withdrawal'],
    required: true
  },
  amount: {
    type: String, // Store the formatted amount as a string
    required: true,
    get: parsedAmount,
    set: formatAmount
  },
  status: {
    type: String,
    default: 'pending',
    required: true
  },
  date: {
    type: String, // Store the formatted date as a string
    required: true,
    default: () => formatDate(new Date())
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

// Ensure getters are applied
transactionSchema.set('toJSON', { getters: true });
transactionSchema.set('toObject', { getters: true });

// Apply formatting before saving
transactionSchema.pre('save', function (next) {
  this.amount = formatAmount(this.amount);
  this.date = formatDate(new Date(this.date));
  next();
});

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
