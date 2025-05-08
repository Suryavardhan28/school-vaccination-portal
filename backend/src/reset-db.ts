import { sequelize } from './config/database';
import seedAdminUser from './seeders/seedAdmin';
import { seedDatabase } from './seeders';
import fs from 'fs';
import path from 'path';

const resetDatabase = async () => {
    try {
        console.log('Starting database reset...');

        // Path to database file
        const dbPath = path.join(__dirname, '../data/database.sqlite');

        // Check if database file exists and delete it
        if (fs.existsSync(dbPath)) {
            console.log('Deleting existing database file...');
            fs.unlinkSync(dbPath);
            console.log('Database file deleted');
        }

        // Force sync all models
        console.log('Creating new database schema...');
        await sequelize.sync({ force: true });

        // Seed admin user with force sync true
        console.log('Seeding admin user...');
        await seedAdminUser(true);

        // Seed other data
        console.log('Seeding sample data...');
        await seedDatabase();

        console.log('Database reset completed successfully!');
        console.log('You can now login with:');
        console.log('Username: admin');
        console.log('Password: password123');
    } catch (error) {
        console.error('Error during database reset:', error);
    } finally {
        process.exit(0);
    }
};

// Run the reset function
resetDatabase(); 