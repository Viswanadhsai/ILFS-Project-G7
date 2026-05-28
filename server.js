const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== SERVE STATIC FRONTEND FILES =====
app.use(express.static(path.join(__dirname, 'public')));

// ===== DATABASE CONNECTION =====
connectDB();

// ===== API ROUTES =====
app.use('/api/lost', require('./routes/lost.routes'));
app.use('/api/found', require('./routes/found.routes'));
app.use('/api/matching', require('./routes/matching.routes'));
app.use('/api/users', require('./routes/user.routes'));

// ===== HEALTH CHECK =====
app.get('/api/health', (req, res) => {
    res.json({ message: 'Backend is running' });
});

// ===== SERVE FRONTEND HTML PAGES =====
// This handles SPA routing - if URL doesn't match API, serve index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ===== ERROR HANDLING =====
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({ 
        message: err.message || 'Internal server error'
    });
});

// ===== START SERVER =====
const PORT = process.env.PORT || 3000;  // ← CHANGED TO 3000
app.listen(PORT, () => {
    
    console.log(`✓ Frontend: http://localhost:${PORT}`);
    console.log(`✓ Backend API: http://localhost:${PORT}/api`);
   
});