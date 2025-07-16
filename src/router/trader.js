const express = require('express');
const multer = require("multer");
const router = express.Router();
const Trader = require('../model/trader');
const User = require('../model/user');
const auth = require('../middleware/auth')
const adminAuth = require("../middleware/adminAuth");

// Setting up multer as a middleware to grab photo uploads
const upload = multer({ storage: multer.memoryStorage() });

// Firebase Configurations
const { initializeApp } = require("firebase/app");
const { getStorage, ref, getDownloadURL, uploadBytesResumable } = require("firebase/storage");
const config = require("../firebase-config");
initializeApp(config); //Initialize a firebase application
const storage = getStorage(); // Initialize Cloud Storage and get a reference to the service

// Route to add a trader to user's selected traders list
router.post('/users/:userId/select-trader/:traderId', auth, async (req, res) => {
  try {
    // Extract user ID and trader ID from request parameters
    const userId = req.params.userId;
    const traderId = req.params.traderId;

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    // Find the trader by ID
    const trader = await Trader.findById(traderId);
    if (!trader) {
      return res.status(404).send({ error: 'Trader not found' });
    }

    // Check if the trader is already in the user's selected traders list
    if (user.selectedTraders.includes(traderId)) {
      return res.status(400).send({ error: 'Trader already selected' });
    }

    // Add the trader to the user's selected traders list
    user.selectedTraders.push(trader);
    await user.save();

    res.send({ message: 'Trader added to selected list' });
  } catch (error) {
    // Handle server errors
    res.status(500).send({ error: 'Internal server error' });
  }
});

// Route to get user's selected traders
router.get('/users/:userId/selected-traders', auth, async (req, res) => {
  try {
    // Extract user ID from request parameters
    const userId = req.params.userId;

    // Find the user by ID and populate the selected traders
    const user = await User.findById(userId).populate('selectedTraders');
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    // Send the selected traders list as response
    res.send(user.selectedTraders);
  } catch (error) {
    // Handle server errors
    res.status(500).send({ error: 'Internal server error' });
  }
});

// Route to remove a trader from user's selected traders list
router.delete('/users/:userId/deselect-trader/:traderId', auth, async (req, res) => {
  try {
    const userId = req.params.userId;
    const traderId = req.params.traderId;

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    // Check if the trader is in the user's selected traders list
    const traderIndex = user.selectedTraders.indexOf(traderId);
    if (traderIndex === -1) {
      return res.status(400).send({ error: 'Trader not found in selected list' });
    }

    // Remove the trader from the user's selected traders list
    user.selectedTraders.splice(traderIndex, 1);
    await user.save();

    res.send({ message: 'Trader removed from selected list' });
  } catch (error) {
    // Handle server errors
    res.status(500).send({ error: 'Internal server error' });
  }
});

// Route to create a new trader
// router.post('/traders', auth, adminAuth, async (req, res) => {
//   try {
//     const { name, winRate, profitShare } = req.body;

//     const trader = new Trader({
//       name,
//       winRate,
//       profitShare
//     });

//     await trader.save();
//     res.status(201).send(trader);
//   } catch (error) {
//     res.status(500).send({ error: 'Internal server error' });
//   }
// });

// Route to create new trader with firebase for image upload
router.post('/traders', upload.single("avatar"), auth, adminAuth, async (req, res) => { //upload.single wont work without multer or similar package
  try {
    const dateTime = giveCurrentDateTime();

    const storageRef = ref(
      storage,
      `files/${req.file.originalname + "       " + dateTime}`
    );

    // Create file metadata including the content type
    const metadata = {
      contentType: req.file.mimetype
    };

    // Upload the file in the bucket storage
    const snapshot = await uploadBytesResumable(
      storageRef,
      req.file.buffer,
      metadata
    );
    //by using uploadBytesResumable we can control the progress of uploading like pause, resume, cancel

    // Grab the public url
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Create trader with other details
    const { name, winRate, profitShare } = req.body;

    const trader = new Trader({
      name,
      winRate,
      profitShare,
      avatar: downloadURL, // Store download URL in trader document
    });

    await trader.save();
    res.status(201).send(trader);
  } catch (error) {
    console.error("Error creating trader: ", error); // Log the error
    res.status(500).send({ error: error.message }); // Send a more detailed error message
  }
});

const giveCurrentDateTime = () => {
  const today = new Date();
  const date =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  const time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  const dateTime = date + " " + time;
  return dateTime;
};
// Route to delete a trader
router.delete('/traders/:traderId', auth, adminAuth, async (req, res) => {
  try {
    const traderId = req.params.traderId;

    const deletedTrader = await Trader.findByIdAndDelete(traderId);
    console.log(deletedTrader)
    if (!deletedTrader) {
      return res.status(404).send({ error: 'Trader not found' });
    }
    res.status(200).send(deletedTrader);
  } catch (error) {
    console.error('Error deleting trader:', error); // Improved error logging
    res.status(500).send({ error: 'Internal server error' });
  }
});

module.exports = router;
