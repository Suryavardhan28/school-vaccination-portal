import { AppBar, Box, Button, Toolbar, Typography, IconButton, Menu, MenuItem } from '@mui/material';
import { AccountCircle, Dashboard, School, Vaccines, MedicalServices, ExitToApp } from '@mui/icons-material';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { logout, getCurrentUser } from '../services/authService';

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const location = useLocation();
  const user = getCurrentUser();

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  if (!user) return null;

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          School Vaccination Portal
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            component={Link}
            to="/"
            color="inherit"
            startIcon={<Dashboard />}
            sx={{ 
              mx: 1, 
              fontWeight: isActive('/') ? 'bold' : 'normal',
              borderBottom: isActive('/') ? '2px solid white' : 'none'
            }}
          >
            Dashboard
          </Button>
          
          <Button
            component={Link}
            to="/students"
            color="inherit"
            startIcon={<School />}
            sx={{ 
              mx: 1, 
              fontWeight: isActive('/students') ? 'bold' : 'normal',
              borderBottom: isActive('/students') ? '2px solid white' : 'none'
            }}
          >
            Students
          </Button>
          
          <Button
            component={Link}
            to="/vaccination-drives"
            color="inherit"
            startIcon={<Vaccines />}
            sx={{ 
              mx: 1, 
              fontWeight: isActive('/vaccination-drives') ? 'bold' : 'normal',
              borderBottom: isActive('/vaccination-drives') ? '2px solid white' : 'none'
            }}
          >
            Vaccination Drives
          </Button>
          
          <Button
            component={Link}
            to="/vaccinations"
            color="inherit"
            startIcon={<MedicalServices />}
            sx={{ 
              mx: 1, 
              fontWeight: isActive('/vaccinations') ? 'bold' : 'normal',
              borderBottom: isActive('/vaccinations') ? '2px solid white' : 'none'
            }}
          >
            Vaccinations
          </Button>
          
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
            sx={{ ml: 2 }}
          >
            <AccountCircle />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem disabled>
              <Typography variant="body2">
                Signed in as <strong>{user.username}</strong>
              </Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ExitToApp fontSize="small" sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 