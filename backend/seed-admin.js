/**
 * seed-admin.js
 *
 * Creates (or updates) the demo admin account in MongoDB.
 * This is the ONLY way to create an account with role = "admin".
 * Registration via the public sign-up page always produces role = "user".
 *
 * Usage:
 *   node seed-admin.js
 *
 * The script is idempotent — safe to run multiple times.
 * If the email already exists with role = "user" it will upgrade it to "admin".
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const ADMIN_EMAIL    = 'admin@pathpilot.ai';
const ADMIN_PASSWORD = 'Admin123';
const ADMIN_NAME     = 'Admin User';

const userSchema = new mongoose.Schema({
    name:      { type: String, required: true, trim: true },
    email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:  { type: String, required: true, select: false },
    role:      { type: String, enum: ['user', 'admin'], default: 'user' },
    createdAt: { type: Date, default: Date.now },
});

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const User = mongoose.model('User', userSchema);

        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

        const result = await User.findOneAndUpdate(
            { email: ADMIN_EMAIL },
            {
                $set: {
                    name:     ADMIN_NAME,
                    email:    ADMIN_EMAIL,
                    password: hashedPassword,
                    role:     'admin',          // only this script can set role = "admin"
                },
                $setOnInsert: {
                    createdAt: new Date(),
                },
            },
            { upsert: true, returnDocument: 'after', select: '-password' }
        );

        console.log(`✅ Admin account ready:`);
        console.log(`   Email    : ${result.email}`);
        console.log(`   Name     : ${result.name}`);
        console.log(`   Role     : ${result.role}`);
        console.log(`   Password : ${ADMIN_PASSWORD}  (hashed in DB)`);
    } catch (err) {
        console.error('❌ Seed failed:', err.message);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

seed();
