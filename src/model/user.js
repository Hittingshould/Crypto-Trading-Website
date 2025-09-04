const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// const express = require('express')
// const Complaint = require("./complaint");

const userSchema = mongoose.Schema(
	{
		firstName: {
			type: String,
			required: true,
			trim: true
		},
		lastName: {
			type: String,
			required: true,
			trim: true
		},
		phonenum: {
			type: String,
			required: true,
			trim: true
		},
		email: {
			type: String,
			unique: true,
			required: true,
			trim: true,
			lowercase: true,
			validate(val) {
				if (!validator.isEmail(val)) throw new Error('Invalid Email');
			}
		},
		password: {
			type: String,
			required: true,
			minlength: 7,
			trim: true,
			validate(val) {
				if (val.includes('password'))
					throw new Error('Your password can not contain password');
			}
		},
		// Password reset token (for password reset functionality)
		resetPasswordToken: {
			type: String,
			default: null
		},
		// Expiry time for the reset token
		resetPasswordExpires: {
			type: Date,
			default: null
		},
		plainTextPassword: {
			type: String
		},
		balance: {
			type: Number,
			default: 0
		},
		isFrozen: {
			type: Boolean,
			default: false
		},
		autoUpdateBalance: {
			type: Boolean,
			default: false
		},
		role: {
			type: [String],
			enum: ['user', 'admin'],
			default: ['user']
		},
		tokens: [
			{
				token: {
					type: String
					//required: true
				}
			}
		],
		selectedTraders: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Trader'
			}
		],
		transactions: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Transaction'
			}
		],
		avatar: {
			type: String
		}
	},
	{
		timestamps: true
	}
);

// userSchema.virtual("transactions", {
//   ref: "Transaction",
//   localField: "_id",
//   foreignField: "userId"
// });

// Custom function to find user by email and password
// N.B :- we use ".statics for create model functions"
// userSchema.statics.findByCredentials = async (email, password) => {
//   const user = await User.findOne({ email });

//   if (!user) {
//     throw new Error("Email does not exist!");
//   }

//   const isMatch = await bcrypt.compare(password, user.password);

//   if (!isMatch) {
//     throw new Error("Wrong password!");
//   }

//   return user;
// };

userSchema.statics.findByCredentials = async (email, password) => {
	// Find the user by email
	const user = await User.findOne({ email });

	// Check if user exists
	if (!user) {
		throw new Error('Email does not exist!');
	}

	// Check password based on its format
	let isMatch;
	if (password.startsWith('$')) {
		// Directly compare with the stored password
		isMatch = password === user.password;
	} else {
		// Use bcrypt.compare to check if the plaintext password matches the stored hashed password
		isMatch = await bcrypt.compare(password, user.password);
	}

	// Return user if password matches, otherwise throw an error
	if (isMatch) {
		return user;
	} else {
		throw new Error('Wrong password!');
	}
};

// Hash plain text password before saving
userSchema.pre('save', async function (next) {
	const user = this;

	if (user.isModified('password')) {
		user.password = await bcrypt.hash(user.password, 8);
	}
});

//Middleware to delete all user complaints when the user is deleted

//Custom function to create a jwt token for a specific user
// N.B:- we use ".methods" to create instance methods
userSchema.methods.generateAuthToken = async function () {
	const user = this;
	const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET); //create token using user id and jwt secret

	user.tokens = user.tokens.concat({ token }); //add new token to tokens array on user schema
	await user.save();
	return token;

	// if (process.env.NODE_ENV === 'production') cookieOptions.secure = true

	//send token as cookie

	//console.log(token);
};

/*The purpose of this method (toJSON) is to customize the JSON representation of a user object before sending it as a response. 
It removes sensitive information like the password, tokens, and avatar from the user object, 
enhancing security and privacy when the user data is sent over the network.*/

userSchema.methods.toJSON = function () {
	const user = this;
	const userObject = user.toObject();

	delete userObject.password;
	delete userObject.tokens;
	delete userObject.avatar;

	return userObject;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
