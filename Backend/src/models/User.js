const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    phone: String,
    notifications: {
        push: { type: Boolean, default: true },
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    firstName: {
        type: String,
        trim: true,
        default: '',
    },
    lastName: {
        type: String,
        trim: true,
        default: '',
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    transactionPin: {
        type: String, // Hashed 4-digit PIN
        select: false, // Don't include in normal queries for security
    },
    isPinSet: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: String,
    verificationTokenExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    kycLevel: {
        type: Number,
        default: 1, // 1: Unverified, 2: BVN Linked, 3: Full ID Verified
    },
    bvn: {
        type: String,
        select: false, // Don't return BVN in normal queries
    },
    balance: {
        type: Number,
        default: 0,
    },
    phoneNumber: {
        type: String,
        default: '',
    },
    referralCode: {
        type: String,
        unique: true,
        default: () => Math.random().toString(36).substring(2, 8).toUpperCase(),
    },
    referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    referralEarnings: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    biometrics: {
        credentialId: String,
        publicKey: String,
        enabled: { type: Boolean, default: false }
    },
    roundUpEnabled: {
        type: Boolean,
        default: false
    },
    accountNumber: {
        type: String,
        unique: true,
        sparse: true
    },
    idDocumentUrl: String,
    utilityBillUrl: String



}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

userSchema.virtual('hasPin').get(function() {
    return !!this.transactionPin;
});

// Password/PIN verification
userSchema.methods.verifyPin = async function(pin) {
    if (!this.transactionPin) return false;
    const bcrypt = require('bcryptjs');
    return await bcrypt.compare(pin, this.transactionPin);
};

// Never return the password hash in API responses
userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.transactionPin;
    return obj;
};

module.exports = mongoose.model('User', userSchema);