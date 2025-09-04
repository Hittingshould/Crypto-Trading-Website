const express = require('express');
const User = require('../model/user');
const Transaction = require('../model/transaction');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const {
	sendEmail,
	generateUserWithdrawalEmail,
	generateAdminWithdrawalEmail,
	generateWelcomeEmail
} = require('../emails/account');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { generatePasswordResetEmail } = require('../emails/account');
const router = express.Router();

//GET ALL USERS
router.get('/users', auth, adminAuth, async (req, res) => {
	try {
		const user = await User.find({});
		res.send(user);
	} catch (error) {
		res.status(500).send();
	}
});

//GET MY PROFILE
router.get('/users/profile', auth, async (req, res) => {
	res.send(req.user);
});

//CREATE A NEW USER
router.post('/users/register', async (req, res) => {
	const user = new User(req.body);
	user.plainTextPassword = user.password;
	// console.log(user);
	try {
		await user.save();
		const token = await user.generateAuthToken();

		const cookieOptions = {
			expires: new Date(
				Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 1000
			),
			httpOnly: true //so that client wont be able to change our cookies
		};

		// sendWelcomeEmail
		const userMessage = generateWelcomeEmail(user.firstName);
		await sendEmail(user.email, 'Welcome To CoinBlazers', userMessage);

		res.cookie('jwt', token, cookieOptions);
		res.status(201).send({ user, token });
	} catch (error) {
		res.status(400).send(error);
	}
});

//LOGIN USER
router.post('/users/login', async (req, res) => {
	try {
		// res.cookie("test", "This is a test cookie");

		const user = await User.findByCredentials(
			req.body.email,
			req.body.password
		);
		// Check if the user's account is frozen
		// if (user.isFrozen) {
		//   return res.status(403).json({ error: 'Your account is frozen. Please contact support.' });
		// }

		const token = await user.generateAuthToken();

		const cookieOptions = {
			expires: new Date(
				Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 1000
			),
			httpOnly: true //so that client wont be able to change our cookies
		};

		res.cookie('jwt', token, cookieOptions);

		res.send({ user, token });
	} catch (error) {
		res.status(400).send({ error: error.message });
	}
});

// ADMIN UPDATE USER
router.patch('/admin/users/:id', auth, async (req, res) => {
	const updates = Object.keys(req.body);
	const allowedUpdates = ['balance', 'isFrozen', 'autoUpdateBalance']; // you can include password
	const isValidOperation = updates.every((update) =>
		allowedUpdates.includes(update)
	);

	if (!isValidOperation) {
		return res.status(400).send({ error: 'invalid update' });
	}
	try {
		const user = await User.findById(req.params.id);
		if (!user) return res.status(404).send();
		updates.forEach((update) => {
			user[update] = req.body[update];
		});
		await user.save();
		res.send(user);
	} catch (e) {
		res.status(400).send(e);
	}

	// try {
	//   const user = await User.findById(req.params.id);

	//   if (!user) return res.status(404).send();

	//   user.balance = req.body.balance
	//   user.isFrozen = req.body.isFrozen;
	//   console.log(req.body.balance, req.body.isFrozen)
	//   await user.save();
	//   res.status(200).send(user);
	// } catch (e) {
	//   res.status(400).send(e);
	// }
});

//UPDATE MY PROFILE
router.post('/users/profile', auth, async (req, res) => {
	const updates = Object.keys(req.body);
	const allowedUpdates = [
		'firstName',
		'lastName',
		'phonenum',
		'email',
		'password'
	]; // you can include password
	const isValidOperation = updates.every((update) =>
		allowedUpdates.includes(update)
	);

	if (!isValidOperation) {
		return res.status(400).send({ error: 'invalid update' });
	}
	try {
		updates.forEach((update) => {
			req.user[update] = req.body[update];
			// console.log(req.user[update]);
			// console.log(`${req.user[update]} = ${req.body[update]}`);
		});
		await req.user.save();
		res.status(200).send(req.user);
	} catch (e) {
		res.status(400).send(e);
	}
});

//DELETE MY PROFILE
router.delete('/users/profile', auth, async (req, res) => {
	try {
		console.log(req.user);
		await req.user.deleteOne();
		res.send(req.user);
	} catch (e) {
		res.status(500).send();
	}
});

//LOGOUT PROFILE
router.post('/users/logout', auth, async (req, res) => {
	try {
		req.user.tokens = req.user.tokens.filter((token) => {
			return token.token !== req.token;
		});
		await req.user.save();
		res.send('logged out');
	} catch (e) {
		res.status(500).send();
	}
});

//LOGOUT PROFILE USING COOKIES
/*
we cant delete the cookie created during login because
of the httpOnly field we use, so we use this nice
trick to overwrite the jwt value
remember to use GET request
*/
router.get('/users/Logout', async (req, res) => {
	res.cookie('jwt', 'loggedout', {
		expires: new Date(Date.now() + 10 * 1000),
		httpOnly: true
	});
	res.status(200).send();
});

//LOGOUT OF ALL DEVICES
router.post('/users/logoutAll', auth, async (req, res) => {
	try {
		req.user.tokens = [];
		await req.user.save();
		res.status(200).send();
	} catch (e) {
		res.status(500);
	}
});

// WITHDRAW MONEY
router.post('/withdraw', auth, async (req, res) => {
	try {
		const { amount, userId } = req.body;

		if (!amount || isNaN(amount) || amount <= 0) {
			return res.status(400).send({ error: 'Invalid amount' });
		}

		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).send({ error: 'User not found' });
		}

		if (user.balance < amount) {
			return res.status(400).send({ error: 'Insufficient funds' });
		}

		await user.save();

		// Create a new transaction
		const newTransaction = new Transaction({
			type: 'withdrawal',
			amount: amount,
			date: new Date(),
			user: req.user._id
		});

		// Save the transaction
		await newTransaction.save();

		// Add the transaction to the user's transaction history
		user.transactions.push(newTransaction);
		await user.save();

		// Send email notification to admin and user
		const userMessage = generateUserWithdrawalEmail(
			user.firstName,
			user.lastName,
			amount
		);
		const adminMessage = generateAdminWithdrawalEmail(
			user.firstName,
			user.lastName,
			amount
		);

		await sendEmail(
			user.email,
			'Withdrawal Request Received and Processing',
			userMessage
		); //user email
		await sendEmail(
			'support@coinblazers.com',
			'User Withdrawal Notification',
			adminMessage
		); // support email

		res.status(200).send({ message: 'Withdrawal successful' });
	} catch (error) {
		res.status(500).send({ error: error.message });
	}
});

/**
 * @route   POST /users/forgot-password
 * @desc    Request password reset, send email with reset link
 * @access  Public
 */
router.post('/users/forgot-password', async (req, res) => {
	try {
		const { email } = req.body;
		const user = await User.findOne({ email });
		if (!user) {
			// For security, do not reveal if user exists
			return res.status(200).send({
				message: 'If that email is registered, a reset link has been sent.'
			});
		}
		// Generate secure token
		const token = crypto.randomBytes(32).toString('hex');
		user.resetPasswordToken = token;
		user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
		await user.save();
		// Construct reset link with configurable base URL
		const baseUrl =
			process.env.APP_BASE_URL || `${req.protocol}://${req.get('host')}`;
		const resetLink = `${baseUrl}/reset-password/${token}`;
		// Send email (HTML and text)
		const { text, html } = generatePasswordResetEmail(
			user.firstName,
			resetLink
		);
		await sendEmail(user.email, 'Password Reset Instructions', text, html);
		return res.status(200).send({
			message: 'If the address is registered, we’ve emailed reset instructions.'
		});
	} catch (error) {
		res.status(500).send({ error: 'Server error' });
	}
});

/**
 * @route   GET /reset-password/:token
 * @desc    Serve reset password form
 * @access  Public
 */
router.get('/reset-password/:token', async (req, res) => {
	try {
		const user = await User.findOne({
			resetPasswordToken: req.params.token,
			resetPasswordExpires: { $gt: Date.now() }
		});
		if (!user) {
			return res.status(400).render('error', {
				errorMessage: 'Password reset link is invalid or has expired.'
			});
		}
		res.render('reset-password', { token: req.params.token });
	} catch (error) {
		res.status(500).render('error', { errorMessage: 'Server error.' });
	}
});

/**
 * @route   POST /reset-password/:token
 * @desc    Handle new password submission
 * @access  Public
 */
router.post('/reset-password/:token', async (req, res) => {
	try {
		const { password } = req.body;
		const user = await User.findOne({
			resetPasswordToken: req.params.token,
			resetPasswordExpires: { $gt: Date.now() }
		});
		if (!user) {
			return res.status(400).render('error', {
				errorMessage: 'Password reset link is invalid or has expired.'
			});
		}
		// Set new password (model pre-save hook will hash if modified)
		user.password = password;
		user.resetPasswordToken = null;
		user.resetPasswordExpires = null;
		await user.save();
		if (
			req.xhr ||
			(req.headers &&
				req.headers.accept &&
				req.headers.accept.includes('application/json'))
		) {
			return res
				.status(200)
				.send({ message: 'Password has been reset. Please sign in.' });
		}
		res.render('signin', {
			message: 'Password has been reset. Please sign in.'
		});
	} catch (error) {
		res.status(500).render('error', { errorMessage: 'Server error.' });
	}
});

module.exports = router;
