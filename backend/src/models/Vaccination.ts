import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import Student from './Student';
import VaccinationDrive from './VaccinationDrive';

// Define Vaccination model for tracking student vaccinations
class Vaccination extends Model {
    public id!: number;
    public studentId!: number;
    public driveId!: number;
    public vaccinationDate!: Date;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Vaccination.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        studentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Student,
                key: 'id',
            },
        },
        driveId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: VaccinationDrive,
                key: 'id',
            },
        },
        vaccinationDate: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName: 'vaccinations',
        indexes: [
            {
                unique: true,
                fields: ['studentId', 'driveId'],
            },
        ],
    }
);

// Establish relationships
Student.hasMany(Vaccination, { foreignKey: 'studentId' });
Vaccination.belongsTo(Student, { foreignKey: 'studentId' });

VaccinationDrive.hasMany(Vaccination, { foreignKey: 'driveId' });
Vaccination.belongsTo(VaccinationDrive, { foreignKey: 'driveId' });

export default Vaccination; 