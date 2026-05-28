const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

// Generate JWT token
function generateToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// ===== REGISTER =====
const register = async (req, res) => {
    try {
        const { name, email, password, username } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Check if username exists (if provided)
        if (username) {
            const existingUsername = await User.findOne({ username });
            if (existingUsername) {
                return res.status(400).json({ message: 'Username already taken' });
            }
        }

        // Create user
        const user = new User({
            name,
            email: email.toLowerCase(),
            password,  // Will be hashed by pre-hook in schema
            username: username || null,
            role: 'user'
        });

        await user.save();

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            token,
            _id: user._id,
            name: user.name,
            email: user.email,
            username: user.username,
            role: user.role
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ===== LOGIN =====
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password required' });
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Generate token
        const token = generateToken(user._id);

        res.json({
            token,
            _id: user._id,
            name: user.name,
            email: user.email,
            username: user.username,
            role: user.role
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ===== GET PROFILE =====
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ===== UPDATE PROFILE =====
const updateProfile = async (req, res) => {
    try {
        const { name, email, username } = req.body;
        const userId = req.user.id;

        // Validation
        if (!name || !email) {
            return res.status(400).json({ message: 'Name and email required' });
        }

        // Check if email already taken by another user
        const existingEmail = await User.findOne({ 
            email: email.toLowerCase(),
            _id: { $ne: userId }
        });
        if (existingEmail) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        // Check if username already taken by another user
        if (username) {
            const existingUsername = await User.findOne({ 
                username,
                _id: { $ne: userId }
            });
            if (existingUsername) {
                return res.status(400).json({ message: 'Username already taken' });
            }
        }

        // Update user
        const user = await User.findByIdAndUpdate(
            userId,
            { 
                name,
                email: email.toLowerCase(),
                username: username || null
            },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ===== CHANGE PASSWORD =====
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        // Validation
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Both passwords required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters' });
        }

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Update password
        user.password = newPassword;
        await user.save();  // Pre-hook will hash it

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ===== DELETE ACCOUNT =====
const deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id;

        // Delete user
        await User.findByIdAndDelete(userId);

        res.json({ message: 'Account deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ===== EXPORT ALL FUNCTIONS =====
module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword,
    deleteAccount
};