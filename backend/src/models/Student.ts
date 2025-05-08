import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

// Define Student model
class Student extends Model {
    public id!: number;
    public name!: string;
    public studentId!: string;
    public class!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Student.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        studentId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        class: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'students',
    }
);

export default Student; 