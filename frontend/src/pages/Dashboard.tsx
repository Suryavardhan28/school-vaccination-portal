import { useState, useEffect } from 'react';
import { Typography, Grid, Paper, Box, Card, CardContent, CardHeader, LinearProgress, Alert, Button, Chip } from '@mui/material';
import { People, Vaccines, Event, School, Download } from '@mui/icons-material';
import { getVaccinationStatistics, VaccinationStatistics } from '../services/vaccinationService';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState<VaccinationStatistics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingReport, setDownloadingReport] = useState<boolean>(false);

  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getVaccinationStatistics();
        setStats(data);
        setError(null);
      } catch (err: unknown) {
        console.error('Error fetching dashboard data:', err);
        if (err && typeof err === 'object' && 'response' in err && 
            err.response && typeof err.response === 'object' && 
            'data' in err.response && err.response.data && 
            typeof err.response.data === 'object' && 
            'message' in err.response.data) {
          const errorMessage = err.response.data.message as string;
          setError(errorMessage);
          showNotification(errorMessage, 'error');
        } else {
          const errorMessage = 'Failed to load dashboard data';
          setError(errorMessage);
          showNotification(errorMessage, 'error');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [showNotification]);

  const handleDownloadReport = async () => {
    try {
      setDownloadingReport(true);
      
      // Make API call to the backend report endpoint with responseType blob
      const response = await api.get('/reports/vaccination-report', {
        responseType: 'blob'
      });
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      const fileName = `Vaccination_Report_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showNotification('Report downloaded successfully', 'success');
    } catch (err) {
      console.error('Error downloading report:', err);
      showNotification('Failed to download report', 'error');
    } finally {
      setDownloadingReport(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard data..." />;
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={handleDownloadReport}
          disabled={downloadingReport}
          color="primary"
          title="Download complete report with all vaccination statistics and records"
        >
          {downloadingReport ? 'Downloading...' : 'Download Full Report'}
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Students Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              height: '100%',
              bgcolor: '#e3f2fd',
              borderRadius: 2
            }}
          >
            <School sx={{ fontSize: 40, mb: 1, color: 'primary.main' }} />
            <Typography variant="h6" gutterBottom align="center">
              Total Students
            </Typography>
            <Typography variant="h3" component="div" align="center">
              {stats?.totalStudents || 0}
            </Typography>
          </Paper>
        </Grid>

        {/* Vaccinated Students Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              height: '100%',
              bgcolor: '#e8f5e9',
              borderRadius: 2
            }}
          >
            <People sx={{ fontSize: 40, mb: 1, color: 'success.main' }} />
            <Typography variant="h6" gutterBottom align="center">
              Vaccinated Students
            </Typography>
            <Typography variant="h3" component="div" align="center">
              {stats?.vaccinatedStudents || 0}
            </Typography>
          </Paper>
        </Grid>

        {/* Vaccination Percentage Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              height: '100%',
              bgcolor: '#fff8e1',
              borderRadius: 2
            }}
          >
            <Vaccines sx={{ fontSize: 40, mb: 1, color: 'warning.main' }} />
            <Typography variant="h6" gutterBottom align="center">
              Vaccination Rate
            </Typography>
            <Typography variant="h3" component="div" align="center">
              {stats?.vaccinationPercentage || 0}%
            </Typography>
            <Box sx={{ width: '100%', mt: 1 }}>
              <LinearProgress 
                variant="determinate" 
                value={stats?.vaccinationPercentage || 0} 
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Upcoming Drives Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              height: '100%',
              bgcolor: '#f3e5f5',
              borderRadius: 2
            }}
          >
            <Event sx={{ fontSize: 40, mb: 1, color: 'secondary.main' }} />
            <Typography variant="h6" gutterBottom align="center">
              Upcoming Drives
            </Typography>
            <Typography variant="h3" component="div" align="center">
              {stats?.upcomingDrives?.length || 0}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Upcoming Vaccination Drives */}
      <Card sx={{ mt: 4 }}>
        <CardHeader 
          title="Upcoming Vaccination Drives" 
          sx={{ bgcolor: 'primary.light', color: 'white' }}
          action={
            <Typography variant="body2" sx={{ color: 'white', mr: 2, mt: 1 }}>
              Total: {stats?.upcomingDrives?.length || 0} drives
            </Typography>
          }
        />
        <CardContent>
          {stats?.upcomingDrives && stats.upcomingDrives.length > 0 ? (
            <Box>
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ mr: 1 }}>Legend:</Typography>
                <Chip 
                  size="small" 
                  label="Within 30 days" 
                  sx={{ 
                    bgcolor: '#e8f5e9', 
                    color: '#2e7d32',
                    borderColor: '#2e7d32',
                    borderWidth: 1,
                    borderStyle: 'solid',
                    mr: 1 
                  }} 
                />
                <Chip 
                  size="small" 
                  label="Future drives" 
                  sx={{ 
                    bgcolor: '#fff', 
                    color: '#0288d1',
                    borderColor: '#0288d1',
                    borderWidth: 1,
                    borderStyle: 'solid'
                  }} 
                />
              </Box>
              <Grid container spacing={2}>
                {stats.upcomingDrives.map((drive) => (
                  <Grid item xs={12} sm={6} md={4} key={drive.id}>
                    <Paper 
                      elevation={2} 
                      sx={{ 
                        p: 2, 
                        borderRadius: 2,
                        bgcolor: drive.isWithin30Days ? '#e8f5e9' : '#fff',
                        borderColor: drive.isWithin30Days ? '#2e7d32' : '#0288d1',
                        borderWidth: 1,
                        borderStyle: 'solid'
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="h6" gutterBottom>
                          {drive.name}
                        </Typography>
                        {drive.isWithin30Days && (
                          <Chip 
                            size="small" 
                            label="Within 30 days"
                            sx={{ 
                              bgcolor: '#2e7d32', 
                              color: 'white',
                              fontSize: '0.7rem',
                              height: 22
                            }} 
                          />
                        )}
                      </Box>
                      <Typography variant="body1" color="textSecondary">
                        Date: {new Date(drive.date).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body1">
                        Available Doses: {drive.availableDoses}
                      </Typography>
                      <Typography variant="body2">
                        Classes: {drive.applicableClasses}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : (
            <Typography variant="body1" align="center" sx={{ py: 4 }}>
              No upcoming vaccination drives scheduled.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard; 