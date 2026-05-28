const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// REGISTER USER
exports.registerUser = async (req, res, next) => {
    console.log("🆕 USER REGISTRATION ATTEMPT:", req.body);

    try {
        const { name, email, password } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            console.log("❌ REGISTRATION FAILED: Email already exists");
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({ name, email, password });

        console.log("✅ USER REGISTERED:", {
            id: user._id,
            name: user.name,
            email: user.email
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id)
        });
    } catch (error) {
        console.log("❌ REGISTRATION ERROR:", error.message);
        next(error);
    }
};

// LOGIN USER
exports.loginUser = async (req, res, next) => {
    console.log("🔐 LOGIN ATTEMPT:", req.body);

    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            console.log("❌ LOGIN FAILED: User not found");
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            console.log("❌ LOGIN FAILED: Incorrect password");
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        console.log("✅ LOGIN SUCCESS:", {
            id: user._id,
            name: user.name,
            email: user.email
        });

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id)
        });
    } catch (error) {
        console.log("❌ LOGIN ERROR:", error.message);
        next(error);
    }
};
