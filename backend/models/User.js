const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose').default;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    googleId: {
        type: String,
        default: null   // null for local users, filled for Google users
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }
});

// passportLocalMongoose adds: username, hash, salt, register(), authenticate(), etc.
// { usernameUnique: false } because Google users might share display names —
// email is already our real unique key.
userSchema.plugin(passportLocalMongoose, { usernameUnique: false });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);