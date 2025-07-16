const express = require('express');
const User = require('../model/user')
const Transaction = require('../model/transaction')
const { sendEmail, generateDepositUserEmail, generateDepositSupportEmail } = require('../emails/account')
const auth = require('../middleware/auth')
const router = express.Router();

router.post('/send-transaction-email', auth, async (req, res) => {
  const { userId, amount } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    // Create a new transaction
    const newTransaction = new Transaction({
      type: 'deposit',
      amount: amount,
      status: 'pending',
      date: new Date(),
      user: req.user._id
    });

    // Save the transaction
    await newTransaction.save();

    // Add the transaction to the user's transaction history
    user.transactions.push(newTransaction);
    await user.save();

    const userMessage = generateDepositUserEmail(user.firstName, user.lastName);
    const adminMessage = generateDepositSupportEmail(user.firstName, user.lastName, 
                          newTransaction.amount, user.email);

    // Send emails
    await sendEmail(user.email, "Payment Received and Processing" ,userMessage); //user email
    await sendEmail("support@coinblazers.com", "User Payment Notification", adminMessage); // support email

    res.status(200).send({ message: 'Emails sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Internal server error' });
  }
})

module.exports = router;