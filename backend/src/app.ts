import authRoutes from './routes/authRoutes';
import studentRoutes from './routes/studentRoutes';
import vaccinationDriveRoutes from './routes/vaccinationDriveRoutes';
import vaccinationRoutes from './routes/vaccinationRoutes';
import reportRoutes from './routes/reportRoutes';

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/vaccination-drives', vaccinationDriveRoutes);
app.use('/api/vaccinations', vaccinationRoutes);
app.use('/api/reports', reportRoutes); 