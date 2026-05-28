// Change password endpoint
router.post('/change-password', authMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);

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
        await user.save();  // ← Pre-hook in model will hash it

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete account endpoint
router.delete('/profile', authMiddleware, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user.id);
        res.json({ message: 'Account deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});