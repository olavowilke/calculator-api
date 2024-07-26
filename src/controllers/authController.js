const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    const {username, password} = req.body;
    try {
        const user = new User({username, password});
        await user.save();
        res.status(201).json({success: true, message: 'User registered successfully'});
    } catch (err) {
        res.status(400).json({success: false, message: err.message});
    }
};

exports.login = async (req, res) => {
    const {username, password} = req.body;
    console.log(req.body)

    try {
        const user = await User.findOne({username});
        console.log(user)

        if (!user) {
            return res.status(404).json({success: false, message: 'Invalid credentials'});
        }

        const isMatch = await user.comparePassword(password);

        console.log(isMatch)
        if (!isMatch) {
            return res.status(400).json({success: false, message: 'Invalid credentials'});
        }

        const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn: '1h'});

        res.status(200).json({success: true, token: `Bearer ${token}`, balance: user.balance});
    } catch (err) {
        res.status(500).json({success: false, message: err.message});
    }
};