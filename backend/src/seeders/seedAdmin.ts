import { sequelize } from '../config/database';
import User from '../models/User';
import bcrypt from 'bcrypt';

// Direct seeding of admin user (without using model hooks)
const seedAdminUser = async (forceSync = false) => {
    try {
        // Only sync with force if explicitly requested
        if (forceSync) {
            console.log('Forcing database sync (this will delete all existing data)...');
            await sequelize.sync({ force: true });
            await User.destroy({ where: {}, truncate: true });
        } else {
            // Just make sure the tables exist
            await sequelize.sync();
        }

        // Check if admin already exists
        const adminExists = await User.findOne({ where: { username: 'admin' } });

        if (!adminExists) {
            // Generate salt and hash manually
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('password123', salt);

            // Create admin directly in database
            const adminUser = await User.create({
                username: 'admin',
                password: hashedPassword, // Pre-hashed password
                role: 'admin'
            });

            console.log('Admin user created with ID:', adminUser.id);

            // Verify the admin was stored correctly
            const verifyAdmin = await User.findOne({
                where: { username: 'admin' },
                raw: true
            });

            if (verifyAdmin) {
                console.log('Verified admin user created successfully');
            }
        } else {
            console.log('Admin user already exists, skipping creation');
        }
    } catch (error) {
        console.error('Error in seedAdminUser:', error);
    }
};

// Run the seed function if this script is executed directly
if (require.main === module) {
    seedAdminUser(true) // Force sync when run directly
        .then(() => {
            console.log('Admin seeding completed');
            process.exit(0);
        })
        .catch(error => {
            console.error('Admin seeding failed:', error);
            process.exit(1);
        });
}

export default seedAdminUser; 