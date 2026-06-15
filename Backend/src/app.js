const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const aiRoutes = require('./routes/aiRoutes');
const savingsRoutes = require('./routes/savingsRoutes');
const pinRoutes = require('./routes/pinRoutes');
const billRoutes = require('./routes/billRoutes');
const cardRoutes = require('./routes/cardRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middlewares/errorHandler');


const app = express();

// ── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests from this IP, please try again after 15 minutes' }
});

app.use('/api/', limiter);


const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps)
            if (!origin) return callback(null, true);
            if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
                return callback(null, true);
            } else {
                return callback(new Error('CORS Policy: This origin is not allowed access.'));
            }
        },
        credentials: true,
    })
);



// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/savings', savingsRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/pin', pinRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/cards', cardRoutes);


// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;