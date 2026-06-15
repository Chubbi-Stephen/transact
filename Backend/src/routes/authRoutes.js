const express = require('express');
const {
    register,
    login,
    logout,
    refreshToken,
    verifyToken,
    getProfile,
    verifyEmail,
    forgotPassword,
    resetPassword,
    upgradeKyc,
    updateProfile,
    updateSettings,
    changePassword,
    setupBiometrics,
    loginBiometrics,
    toggleRoundUp
} = require('../controllers/authController');
const { authenticate } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticate, logout);
router.post('/refresh-token', refreshToken);
router.get('/verify', authenticate, verifyToken);
router.get('/profile', authenticate, getProfile);
router.post('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/upgrade-kyc', authenticate, upgradeKyc);
router.post('/upgrade-kyc-full', authenticate, upload.fields([
    { name: 'idDocument', maxCount: 1 },
    { name: 'utilityBill', maxCount: 1 }
]), upgradeKyc);
router.put('/update-profile', authenticate, updateProfile);
router.put('/update-settings', authenticate, updateSettings);
router.put('/change-password', authenticate, changePassword);
router.post('/setup-biometrics', authenticate, setupBiometrics);
router.post('/login-biometrics', loginBiometrics);
router.post('/toggle-roundup', authenticate, toggleRoundUp);



module.exports = router;