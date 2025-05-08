import { Box, Container } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { NotificationProvider } from '../contexts/NotificationContext';
import Notification from './Notification';

const Layout = () => {
  return (
    <NotificationProvider>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
          <Outlet />
        </Container>
        <Notification />
      </Box>
    </NotificationProvider>
  );
};

export default Layout; 