import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

// Define Student model
class Student extends Model {
    public id!: number;
    public name!: string;
    public studentId!: string;
    public class!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    // Add static property for valid classes
    public static readonly VALID_CLASSES = [
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
    ];
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
            validate: {
                isIn: [Student.VALID_CLASSES],
            },
        },
    },
    {
        sequelize,
        tableName: "students",
    }
);

export default Student;
