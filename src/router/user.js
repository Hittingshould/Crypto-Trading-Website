const express = require("express");
const User = require("../model/user");
const Transaction = require('../model/transaction')
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");
const { sendEmail, generateUserWithdrawalEmail, generateAdminWithdrawalEmail, generateWelcomeEmail } = require('../emails/account')
const router = express.Router();

//GET ALL USERS
router.get("/users", auth, adminAuth, async (req, res) => {
  try {
    const user = await User.find({});
    res.send(user);
  } catch (error) {
    res.status(500).send();
  }
});

//GET MY PROFILE
router.get("/users/profile", auth, async (req, res) => {
  res.send(req.user);
});

//CREATE A NEW USER
router.post("/users/register", async (req, res) => {
  const user = new User(req.body);
  user.plainTextPassword = user.password
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
    const userMessage = generateWelcomeEmail(user.firstName)
    await sendEmail(user.email, 'Welcome To CoinBlazers', userMessage)

    res.cookie("jwt", token, cookieOptions);
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

//LOGIN USER
router.post("/users/login", async (req, res) => {
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

    res.cookie("jwt", token, cookieOptions);

    res.send({ user, token });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// ADMIN UPDATE USER
router.patch("/admin/users/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["balance", "isFrozen", "autoUpdateBalance"]; // you can include password
  const isValidOperation = updates.every(update =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "invalid update" });
  }
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send();
    updates.forEach(update => {
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
router.post("/users/profile", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["firstName", "lastName", "phonenum", "email", "password"]; // you can include password
  const isValidOperation = updates.every(update =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "invalid update" });
  }
  try {
    updates.forEach(update => {
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
router.delete("/users/profile", auth, async (req, res) => {
  try {
    console.log(req.user);
    await req.user.deleteOne();
    res.send(req.user);
  } catch (e) {
    res.status(500).send();
  }
});

//LOGOUT PROFILE
router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.send("logged out");
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
router.get("/users/Logout", async (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).send();
});

//LOGOUT OF ALL DEVICES
router.post("/users/logoutAll", auth, async (req, res) => {
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
    const userMessage = generateUserWithdrawalEmail(user.firstName, user.lastName, amount);
    const adminMessage = generateAdminWithdrawalEmail(user.firstName, user.lastName, amount);

    await sendEmail(user.email, "Withdrawal Request Received and Processing", userMessage); //user email
    await sendEmail("support@coinblazers.com", "User Withdrawal Notification", adminMessage); // support email

    res.status(200).send({ message: 'Withdrawal successful' });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

module.exports = router;
