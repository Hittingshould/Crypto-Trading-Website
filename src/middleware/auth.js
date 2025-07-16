const jwt = require("jsonwebtoken");
const User = require("../model/user");
const Transaction = require("../model/transaction"); // always require model when using populate
const Trader = require('../model/trader')

const auth = async (req, res, next) => {
  // console.log(req.cookies.jwt);
  try {
    let token;

    // Check for token in Authorization header
    if (
      req.header("Authorization") &&
      req.header("Authorization").startsWith("Bearer")
    ) {
      token = req.header("Authorization").replace("Bearer ", "");
    }
    // If not found, check for token in cookies
    else if (req.cookies.jwt) {
      //INSTALL COOKIE-PARSER FOR THIS TO WORK
      // console.log("hey there");
      token = req.cookies.jwt;
      // console.log(token);
    } else {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token
    }).populate("selectedTraders").populate('transactions');

    // console.log(token);
    // console.log(user);

    if (!user) {
      throw new Error();
    }
    //req.token = token;
    req.user = user;
    res.locals.user = user; //THIS EXPOSES THE USER TO OUR PUG TEMPLATES. AWESOME!!
    next();
  } catch (e) {
    res.status(401).render('error', {
      errorMessage: 'please authenticate'
    });
  }
};

module.exports = auth;
