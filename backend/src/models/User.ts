import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import bcrypt from 'bcrypt';

// Define User model
class User extends Model {
    public id!: number;
    public username!: string;
    public password!: string;
    public role!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    // Method to check if provided password matches stored hash
    public async validatePassword(password: string): Promise<boolean> {
        if (!password || !this.password) {
            return false;
        }
        try {
            return await bcrypt.compare(password, this.password);
        } catch (error) {
            console.error('Password validation error:', error);
            return false;
        }
    }
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'user',
        },
    },
    {
        sequelize,
        tableName: 'users',
        hooks: {
            // Hash password before saving
            beforeCreate: async (user: User) => {
                if (user.password) {
                    try {
                        const salt = await bcrypt.genSalt(10);
                        user.password = await bcrypt.hash(user.password, salt);
                    } catch (error) {
                        console.error('Error hashing password:', error);
                        throw new Error('Failed to hash password');
                    }
                }
            },
            beforeUpdate: async (user: User) => {
                if (user.changed('password')) {
                    try {
                        const salt = await bcrypt.genSalt(10);
                        user.password = await bcrypt.hash(user.password, salt);
                    } catch (error) {
                        console.error('Error hashing password:', error);
                        throw new Error('Failed to hash password');
                    }
                }
            },
        },
    }
);

export default User; 