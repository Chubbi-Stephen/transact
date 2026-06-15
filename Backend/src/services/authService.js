const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_in_production';
const JWT_EXPIRES_IN = '7d';

class AuthService {
    async register(userData) {
        const { username, email, password, firstName = '', lastName = '', referralCode = '' } = userData;

        const existing = await User.findOne({ $or: [{ email }, { username }] });
        if (existing) throw new Error('A user with that email or username already exists');

        let inviter = null;
        if (referralCode) {
            inviter = await User.findOne({ referralCode: referralCode.toUpperCase() });
            if (!inviter) console.warn('Invalid referral code used:', referralCode);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Generate Verification Token
        const crypto = require('crypto');
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

        const newUser = new User({
            username, email, password: hashedPassword, firstName, lastName,
            verificationToken, verificationTokenExpires,
            referredBy: inviter ? inviter._id : null,
            accountNumber: Math.floor(1000000000 + Math.random() * 9000000000).toString()
        });
        await newUser.save();


        const sendEmail = require('../utils/sendEmail');
        await sendEmail({
            email: newUser.email,
            subject: 'Verify your Tranxact Account',
            message: `Please verify your account by using this token: ${verificationToken}`,
            html: `<h1>Welcome to Tranxact</h1><p>Click here to verify: <a href="${process.env.FRONTEND_URL}/verify/${verificationToken}">Verify Now</a></p>`
        });

        const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        return { user: newUser, token };
    }

    async verifyEmail(token) {
        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpires: { $gt: Date.now() }
        });

        if (!user) throw new Error('Invalid or expired verification token');

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();
        return user;
    }

    async forgotPassword(email) {
        const user = await User.findOne({ email });
        if (!user) throw new Error('No user found with that email');

        const crypto = require('crypto');
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 1 * 60 * 60 * 1000; // 1 hour
        await user.save();

        const sendEmail = require('../utils/sendEmail');
        await sendEmail({
            email: user.email,
            subject: 'Password Reset Request',
            message: `You requested a password reset. Use this token: ${resetToken}`,
            html: `<p>Click here to reset your password: <a href="${process.env.FRONTEND_URL}/reset-password/${resetToken}">Reset Password</a></p>`
        });
    }

    async resetPassword(token, newPassword) {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) throw new Error('Invalid or expired reset token');

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        return true;
    }

    async upgradeKyc(userId, { level, bvn, documentType, documentNumber }, files = {}) {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');
        
        if (Number(level) === 2) {
            if (!bvn || !/^\d{11}$/.test(bvn)) throw new Error('Invalid BVN format. Must be exactly 11 digits.');
            
            /* 
            // ── PRODUCTION INTEGRATION BLUEPRINT ─────────────────────────────────────
            // This is where you connect to NIBSS via Paystack/SmileID
            const verify = await axios.get(`https://api.paystack.co/bank/resolve_bvn/${bvn}`, {
                headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
            });
            
            if (!verify.data.status) throw new Error('BVN Verification failed');
            if (verify.data.data.first_name.toUpperCase() !== user.firstName.toUpperCase()) {
                throw new Error('Name mismatch: BVN belongs to a different person');
            }
            // ────────────────────────────────────────────────────────────────────────
            */

            user.bvn = bvn;
            user.kycLevel = 2;
        } else if (Number(level) === 3) {


            if (!documentType || !documentNumber) throw new Error('Document details are required for Tier 3');
            user.kycLevel = 3;
            
            // Save file paths if present
            if (files.idDocument) {
                user.idDocumentUrl = `/uploads/${files.idDocument[0].filename}`;
            }
            if (files.utilityBill) {
                user.utilityBillUrl = `/uploads/${files.utilityBill[0].filename}`;
            }
        }
        
        await user.save();
        return user;
    }


    async updateProfile(userId, profileData) {
        const user = await User.findByIdAndUpdate(
            userId,
            { $set: profileData },
            { new: true, runValidators: true }
        );
        return user;
    }

    async updateSettings(userId, settingsData) {
        const user = await User.findByIdAndUpdate(
            userId,
            { $set: { notifications: settingsData.notifications } },
            { new: true }
        );
        return user;
    }

    async changePassword(userId, { oldPassword, newPassword }) {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');
        
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) throw new Error('Incorrect old password');
        
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        return true;
    }

    async login(credentials) {
        const { email, username, password } = credentials;

        // Allow login by email OR username
        const user = await User.findOne(email ? { email } : { username });
        if (!user) {
            throw new Error('User not found');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        return { user, token };
    }

    async logout(userId) {
        // JWT is stateless — client discards the token.
        // For production, maintain a token blacklist in Redis.
        return { message: 'Logged out successfully' };
    }

    async refreshToken(body) {
        const { token } = body;
        if (!token) throw new Error('Token is required');
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            const newToken = jwt.sign({ id: decoded.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
            return { token: newToken };
        } catch (err) {
            throw new Error('Invalid or expired token');
        }
    }

    async getUserById(userId) {
        const user = await User.findById(userId).select('-password');
        if (user && !user.accountNumber) {
            user.accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
            await user.save();
        }
        return user;
    }

}

module.exports = new AuthService();