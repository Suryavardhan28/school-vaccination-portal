import { Student, VaccinationDrive, Vaccination } from '../models';

// Sample student data
const seedStudents = async () => {
    try {
        // Check if students already exist
        const count = await Student.count();

        if (count === 0) {
            // Create sample students for all classes (1-12)
            const students = [
                // Class 1
                { name: 'Aiden Murphy', studentId: 'S0101', class: '1' },
                { name: 'Lily Chen', studentId: 'S0102', class: '1' },
                { name: 'Noah Parker', studentId: 'S0103', class: '1' },
                { name: 'Zoe Williams', studentId: 'S0104', class: '1' },

                // Class 2
                { name: 'Ethan Rodriguez', studentId: 'S0201', class: '2' },
                { name: 'Mia Thompson', studentId: 'S0202', class: '2' },
                { name: 'Lucas White', studentId: 'S0203', class: '2' },
                { name: 'Harper Davis', studentId: 'S0204', class: '2' },

                // Class 3
                { name: 'Jackson Lee', studentId: 'S0301', class: '3' },
                { name: 'Sofia Martin', studentId: 'S0302', class: '3' },
                { name: 'Benjamin Clark', studentId: 'S0303', class: '3' },
                { name: 'Amelia Lewis', studentId: 'S0304', class: '3' },

                // Class 4
                { name: 'Mason Young', studentId: 'S0401', class: '4' },
                { name: 'Isabella Walker', studentId: 'S0402', class: '4' },
                { name: 'Logan Hall', studentId: 'S0403', class: '4' },
                { name: 'Charlotte Allen', studentId: 'S0404', class: '4' },

                // Class 5
                { name: 'John Smith', studentId: 'S0501', class: '5' },
                { name: 'Emily Johnson', studentId: 'S0502', class: '5' },
                { name: 'Ryan Turner', studentId: 'S0503', class: '5' },
                { name: 'Aria Mitchell', studentId: 'S0504', class: '5' },

                // Class 6
                { name: 'Michael Brown', studentId: 'S0601', class: '6' },
                { name: 'Sophia Garcia', studentId: 'S0602', class: '6' },
                { name: 'Elijah Brooks', studentId: 'S0603', class: '6' },
                { name: 'Scarlett Cooper', studentId: 'S0604', class: '6' },

                // Class 7
                { name: 'William Davis', studentId: 'S0701', class: '7' },
                { name: 'Olivia Martinez', studentId: 'S0702', class: '7' },
                { name: 'Henry Adams', studentId: 'S0703', class: '7' },
                { name: 'Abigail Scott', studentId: 'S0704', class: '7' },

                // Class 8
                { name: 'James Wilson', studentId: 'S0801', class: '8' },
                { name: 'Emma Anderson', studentId: 'S0802', class: '8' },
                { name: 'Daniel King', studentId: 'S0803', class: '8' },
                { name: 'Evelyn Wright', studentId: 'S0804', class: '8' },

                // Class 9
                { name: 'Alexander Thomas', studentId: 'S0901', class: '9' },
                { name: 'Ava Jackson', studentId: 'S0902', class: '9' },
                { name: 'Sebastian Hill', studentId: 'S0903', class: '9' },
                { name: 'Madison Nelson', studentId: 'S0904', class: '9' },

                // Class 10
                { name: 'Matthew Harris', studentId: 'S1001', class: '10' },
                { name: 'Grace Morgan', studentId: 'S1002', class: '10' },
                { name: 'David Stewart', studentId: 'S1003', class: '10' },
                { name: 'Chloe Reed', studentId: 'S1004', class: '10' },

                // Class 11
                { name: 'Joseph Phillips', studentId: 'S1101', class: '11' },
                { name: 'Ella Hughes', studentId: 'S1102', class: '11' },
                { name: 'Carter Russell', studentId: 'S1103', class: '11' },
                { name: 'Victoria Foster', studentId: 'S1104', class: '11' },

                // Class 12
                { name: 'Samuel Barnes', studentId: 'S1201', class: '12' },
                { name: 'Layla Powell', studentId: 'S1202', class: '12' },
                { name: 'Owen Butler', studentId: 'S1203', class: '12' },
                { name: 'Audrey Price', studentId: 'S1204', class: '12' }
            ];

            await Student.bulkCreate(students);
            console.log('Sample students created successfully');
        }
    } catch (error) {
        console.error('Error seeding students:', error);
    }
};

// Sample vaccination drive data
const seedVaccinationDrives = async () => {
    try {
        // Check if vaccination drives already exist
        const count = await VaccinationDrive.count();

        if (count === 0) {
            // Create dates for both past and upcoming vaccination drives
            const today = new Date();

            // Past dates
            const pastDate1 = new Date();
            pastDate1.setDate(today.getDate() - 60); // 2 months ago

            const pastDate2 = new Date();
            pastDate2.setDate(today.getDate() - 30); // 1 month ago

            // Future dates
            const futureDate1 = new Date();
            futureDate1.setDate(today.getDate() + 20); // 20 days in future

            const futureDate2 = new Date();
            futureDate2.setDate(today.getDate() + 35); // 35 days in future

            const futureDate3 = new Date();
            futureDate3.setDate(today.getDate() + 50); // 50 days in future

            // Create sample vaccination drives (both past and upcoming)
            const drives = [
                {
                    name: 'Hepatitis B Vaccine',
                    date: pastDate1,
                    availableDoses: 0, // All doses used
                    applicableClasses: '1,2,3'
                },
                {
                    name: 'Polio Vaccine',
                    date: pastDate2,
                    availableDoses: 0, // All doses used
                    applicableClasses: '4,5,6'
                },
                {
                    name: 'Flu Vaccine',
                    date: futureDate1,
                    availableDoses: 100,
                    applicableClasses: '7,8,9'
                },
                {
                    name: 'Measles Vaccine',
                    date: futureDate2,
                    availableDoses: 150,
                    applicableClasses: '10,11,12'
                },
                {
                    name: 'COVID-19 Booster',
                    date: futureDate3,
                    availableDoses: 200,
                    applicableClasses: '5,6,7,8,9,10,11,12'
                }
            ];

            await VaccinationDrive.bulkCreate(drives);
            console.log('Sample vaccination drives created successfully');
        }
    } catch (error) {
        console.error('Error seeding vaccination drives:', error);
    }
};

// Sample vaccination records
const seedVaccinations = async () => {
    try {
        // Check if vaccinations already exist
        const count = await Vaccination.count();

        if (count === 0) {
            // Get students and drives for reference
            const students = await Student.findAll();
            const drives = await VaccinationDrive.findAll();

            // Filter past drives (first two drives in our seed data)
            const pastDrives = drives.filter(drive => new Date(drive.date) < new Date());

            if (pastDrives.length === 0 || students.length === 0) {
                console.log('No past drives or students found to create vaccination records');
                return;
            }

            // Create vaccination records for past drives
            const vaccinations: {
                studentId: number;
                driveId: number;
                vaccinationDate: Date;
            }[] = [];

            // For first past drive (Hepatitis B) - Classes 1,2,3
            const drive1 = pastDrives[0];
            const eligibleStudents1 = students.filter(student =>
                ['1', '2', '3'].includes(student.class)
            );

            eligibleStudents1.forEach(student => {
                const vaccinationDate = new Date(drive1.date);
                // Add some randomness to vaccination dates (within a week of the drive)
                vaccinationDate.setDate(vaccinationDate.getDate() + Math.floor(Math.random() * 7));

                vaccinations.push({
                    studentId: student.id,
                    driveId: drive1.id,
                    vaccinationDate
                });
            });

            // For second past drive (Polio) - Classes 4,5,6
            if (pastDrives.length > 1) {
                const drive2 = pastDrives[1];
                const eligibleStudents2 = students.filter(student =>
                    ['4', '5', '6'].includes(student.class)
                );

                eligibleStudents2.forEach(student => {
                    // Skip some students to simulate not everyone getting vaccinated
                    if (Math.random() > 0.25) { // 75% of eligible students got vaccinated
                        const vaccinationDate = new Date(drive2.date);
                        // Add some randomness to vaccination dates (within a week of the drive)
                        vaccinationDate.setDate(vaccinationDate.getDate() + Math.floor(Math.random() * 7));

                        vaccinations.push({
                            studentId: student.id,
                            driveId: drive2.id,
                            vaccinationDate
                        });
                    }
                });
            }

            // Create all vaccination records
            if (vaccinations.length > 0) {
                await Vaccination.bulkCreate(vaccinations);
                console.log(`${vaccinations.length} sample vaccination records created successfully`);
            }
        }
    } catch (error) {
        console.error('Error seeding vaccinations:', error);
    }
};

// Main seed function
export const seedDatabase = async () => {
    await seedStudents();
    await seedVaccinationDrives();
    await seedVaccinations(); // Add this call to seed vaccinations
    console.log('Database seeding completed');
};

// Run seeder if directly executed
if (require.main === module) {
    seedDatabase()
        .then(() => {
            console.log('Seeding completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Error during seeding:', error);
            process.exit(1);
        });
} 