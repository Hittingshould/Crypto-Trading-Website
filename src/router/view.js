const path = require('path');
const express = require('express');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const router = express.Router();
const Trader = require('../model/trader');
const User = require('../model/user');
const Transaction = require('../model/transaction');

// Route for static pages (assuming it's also in the public directory)
router.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'index.html'));
});

router.get('/about', (req, res) => {
	res.sendFile(path.join(__dirname, '..', 'public', 'about.html'));
});

router.get('/services', (req, res) => {
	res.sendFile(path.join(__dirname, '..', 'public', 'services.html'));
});

router.get('/contact', (req, res) => {
	res.sendFile(path.join(__dirname, '..', 'public', 'contact.html'));
});

// Router for pug pages

// Route to fetch all pending transactions
router.get('/transactions/pending', auth, adminAuth, async (req, res) => {
	try {
		// Fetch all pending transactions and populate user details
		const pendingTransactions = await Transaction.find({
			status: 'pending'
		}).populate('user');

		// Render the transactions page with the fetched data
		res.render('pending-transactions', { transactions: pendingTransactions });
	} catch (error) {
		// console.error('Error fetching pending transactions:', error);
		res.status(500).send('Internal Server Error');
	}
});

// Route to fetch all approved transactions
router.get('/transactions/approved', auth, adminAuth, async (req, res) => {
	try {
		// Fetch all pending transactions and populate user details
		const approvedTransactions = await Transaction.find({
			status: 'approved'
		}).populate('user');

		// Render the transactions page with the fetched data
		res.render('approved-transactions', { transactions: approvedTransactions });
	} catch (error) {
		// console.error('Error fetching approved transactions:', error);
		res.status(500).send('Internal Server Error');
	}
});

// Route to fetch all canceled transactions
router.get('/transactions/canceled', auth, adminAuth, async (req, res) => {
	try {
		// Fetch all pending transactions and populate user details
		const canceledTransactions = await Transaction.find({
			status: 'canceled'
		}).populate('user');

		// Render the transactions page with the fetched data
		res.render('canceled-transactions', { transactions: canceledTransactions });
	} catch (error) {
		// console.error('Error fetching canceled transactions:', error);
		res.status(500).send('Internal Server Error');
	}
});

router.get('/account', auth, async (req, res) => {
	try {
		const traders = await Trader.find();
		res.status(200).render('user-dashboard', {
			traders,
			selectedTraders: req.user.selectedTraders.map((trader) =>
				trader._id.toString()
			)
		});
	} catch (e) {
		res.status(500).send({ error: 'Internal server error' });
	}
});

router.get('/traders', auth, async (req, res) => {
	try {
		const traders = await Trader.find();
		res.status(200).render('traders', {
			traders,
			selectedTraders: req.user.selectedTraders.map((trader) =>
				trader._id.toString()
			)
		});
	} catch (e) {
		res.status(500).send({
			error: e
		});
	}
});

router.get('/signup', (req, res) => {
	res.render('signup');
});

// router.get('/error', (req, res) => {
//   const errorMessage = req.query.message || 'An unknown error occurred.';
//   res.render('error', { errorMessage });
// });

router.get('/signin', (req, res) => {
	res.render('signin');
});

router.get('/admin', auth, adminAuth, async (req, res) => {
	const users = await User.find();
	res.status(200).render('admin-dashboard', { users });
});

router.get('/admin-traders', auth, adminAuth, async (req, res) => {
	const traders = await Trader.find();
	res.status(200).render('admin-dashboard-trader', { traders });
});

router.get('/user-profile', auth, async (req, res) => {
	res.status(200).render('user-profile');
});

router.get('/withdraw', auth, async (req, res) => {
	res.status(200).render('withdraw');
});

router.get('/deposit', auth, async (req, res) => {
	res.status(200).render('deposit');
});

router.get('/confirm-message', auth, async (req, res) => {
	res.status(200).render('email');
});

router.get('/confirm-deposit', auth, async (req, res) => {
	res.status(200).render('confirm-deposit');
});

/**
 * @route   GET /forgot-password
 * @desc    Render forgot password form
 * @access  Public
 */
router.get('/forgot-password', (req, res) => {
	res.render('forgot-password');
});

/**
 * @route   GET /reset-password/:token
 * @desc    Render reset password form (handled in user.js for token validation)
 * @access  Public
 */
// This route is handled in user.js to validate the token before rendering
// router.get('/reset-password/:token', ...)

module.exports = router;
