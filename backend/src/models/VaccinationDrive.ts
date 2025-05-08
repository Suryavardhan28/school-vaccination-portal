import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

// Define VaccinationDrive model
class VaccinationDrive extends Model {
    public id!: number;
    public name!: string;
    public date!: Date;
    public availableDoses!: number;
    public applicableClasses!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

VaccinationDrive.init(
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
        date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        availableDoses: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        applicableClasses: {
            type: DataTypes.STRING,  // Storing as comma-separated string, e.g., "5,6,7"
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'vaccination_drives',
    }
);

export default VaccinationDrive; 