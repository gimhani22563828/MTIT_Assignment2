const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to Database');

        const existingAdmin = await User.findOne({ email: 'admin@gmail.com' });
        if (existingAdmin) {
            console.log('Admin user already exists!');
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash('123456', 10);
        const admin = new User({
            name: 'Super Admin',
            email: 'admin@gmail.com',
            password: hashedPassword,
            role: 'admin'
        });

        await admin.save();
        console.log('Admin user seeded successfully. Details: admin@gmail.com / 123456');
        process.exit(0);
    } catch (err) {
        console.error('Failed to seed admin:', err);
        process.exit(1);
    }
};

seedAdmin();
