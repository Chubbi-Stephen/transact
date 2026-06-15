const AuthService = require('../services/authService');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '24h';

const register = async (req, res) => {
    try {
        const { user, token } = await AuthService.register(req.body);
        res.status(201).json({ user, token });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { user, token } = await AuthService.login(req.body);
        res.status(200).json({ user, token });
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};

const logout = async (req, res) => {
    res.status(200).json({ message: 'Logged out successfully' });
};

const refreshToken = async (req, res) => {
    try {
        const { token } = await AuthService.refreshToken(req.user._id);
        res.status(200).json({ token });
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};

const verifyToken = async (req, res) => {
    // authMiddleware already verified + attached req.user
    res.status(200).json({ user: req.user });
};

const verifyEmail = async (req, res) => {
	try {
		const user = await AuthService.verifyEmail(req.params.token);
		res.status(200).json({ message: 'Email verified successfully', user });
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};

const forgotPassword = async (req, res) => {
	try {
		await AuthService.forgotPassword(req.body.email);
		res.status(200).json({ message: 'Reset email sent' });
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};

const resetPassword = async (req, res) => {
	try {
		await AuthService.resetPassword(req.params.token, req.body.password);
		res.status(200).json({ message: 'Password reset successful' });
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};

const getProfile = async (req, res) => {
    try {
        const user = await AuthService.getUserById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const upgradeKyc = async (req, res) => {
	try {
		const user = await AuthService.upgradeKyc(req.user._id, req.body, req.files);
		res.status(200).json({ message: 'KYC upgrade mapping successful', user });
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};


const updateProfile = async (req, res) => {
	try {
		const user = await AuthService.updateProfile(req.user._id, req.body);
		res.status(200).json({ message: 'Profile updated', user });
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};

const updateSettings = async (req, res) => {
	try {
		const user = await AuthService.updateSettings(req.user._id, req.body);
		res.status(200).json({ message: 'Settings updated', user });
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};

const changePassword = async (req, res) => {
	try {
		await AuthService.changePassword(req.user._id, req.body);
		res.status(200).json({ message: 'Password changed successfully' });
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};

const setupBiometrics = async (req, res) => {
    try {
        const { credentialId, publicKey } = req.body;
        const user = await User.findById(req.user._id);
        
        user.biometrics = {
            credentialId,
            publicKey,
            enabled: true
        };
        
        await user.save();
        res.status(200).json({ message: 'Biometrics enabled', user });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const loginBiometrics = async (req, res) => {
    try {
        const { credentialId } = req.body;
        const user = await User.findOne({ 'biometrics.credentialId': credentialId });
        
        if (!user || !user.biometrics.enabled) {
            throw new Error('Biometrics not found or disabled for this account');
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        res.status(200).json({ user, token });
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};

const toggleRoundUp = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.roundUpEnabled = !user.roundUpEnabled;
        await user.save();
        res.status(200).json({ 
            message: `Round-up ${user.roundUpEnabled ? 'enabled' : 'disabled'}`, 
            roundUpEnabled: user.roundUpEnabled 
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { 
    register, login, logout, refreshToken, verifyToken, getProfile, 
    verifyEmail, forgotPassword, resetPassword, upgradeKyc,
    updateProfile, updateSettings, changePassword,
    setupBiometrics, loginBiometrics, toggleRoundUp
};