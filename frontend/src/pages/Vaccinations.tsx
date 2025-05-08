import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  Grid,
  IconButton,
  Chip,
  SelectChangeEvent
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  getVaccinations,
  createVaccination,
  deleteVaccination,
  Vaccination,
  VaccinationFilters,
  VaccinationCreateRequest
} from '../services/vaccinationService';
import {
  getStudents,
  Student
} from '../services/studentService';
import {
  getVaccinationDrives,
  VaccinationDrive
} from '../services/vaccinationDriveService';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNotification } from '../contexts/NotificationContext';
import useModalError from '../hooks/useModalError';
import ModalErrorAlert from '../components/ModalErrorAlert';
import SortableTable, { Column, SortDirection } from '../components/SortableTable';


const Vaccinations = () => {
  // State for vaccinations list
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Filter state
  const [studentIdFilter, setStudentIdFilter] = useState<string>('');
  const [driveIdFilter, setDriveIdFilter] = useState<number | ''>('');
  const [vaccineNameFilter, setVaccineNameFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedVaccinationId, setSelectedVaccinationId] = useState<number | null>(null);

  // Form state
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [drives, setDrives] = useState<VaccinationDrive[]>([]);
  const [formData, setFormData] = useState({
    studentId: 0,
    driveId: 0,
    vaccinationDate: new Date()
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [eligibleClasses, setEligibleClasses] = useState<string[]>([]);

  // Add notification hook
  const { showNotification } = useNotification();

  // Add modal error handling
  const { error: modalError, setModalError, clearError } = useModalError();

  // Add sort state
  const [sortField, setSortField] = useState<string>('vaccinationDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Load vaccinations on initial render and when filters/pagination change
  useEffect(() => {
    fetchVaccinations();
  }, [page, rowsPerPage, studentIdFilter, driveIdFilter, vaccineNameFilter]);

  // Load students and drives for dropdowns
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const studentsResponse = await getStudents(1, 100); // Get up to 100 students
        setStudents(studentsResponse.students);

        const drivesResponse = await getVaccinationDrives(1, 100, true); // Get only upcoming drives
        // Filter out drives with no available doses
        const validDrives = drivesResponse.vaccinationDrives.filter(drive =>
          drive.availableDoses > 0
        );

        if (validDrives.length === 0 && drivesResponse.vaccinationDrives.length > 0) {
          console.warn('No drives with available doses found, showing all drives for reference');
        }

        setDrives(drivesResponse.vaccinationDrives);
      } catch (err) {
        console.error('Error loading dropdown data:', err);
        setPageError('Failed to load students or vaccination drives.');
      }
    };

    loadDropdownData();
  }, []);

  const fetchVaccinations = async () => {
    try {
      setLoading(true);
      setPageError(null);

      const filters: VaccinationFilters = {};
      if (studentIdFilter) filters.studentId = studentIdFilter;
      if (driveIdFilter) filters.driveId = driveIdFilter as number;
      if (vaccineNameFilter) filters.vaccineName = vaccineNameFilter;

      const response = await getVaccinations(page + 1, rowsPerPage, filters);

      setVaccinations(response.vaccinations);
      setTotalCount(response.total);
    } catch (err) {
      console.error('Error fetching vaccinations:', err);
      setPageError('Failed to load vaccinations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle dialog open/close
  const handleOpenAddDialog = () => {
    setFormData({
      studentId: 0,
      driveId: 0,
      vaccinationDate: new Date()
    });
    setCurrentStep(1);
    setFilteredStudents([]);
    setEligibleClasses([]);
    setOpenAddDialog(true);
  };

  const handleOpenDeleteDialog = (vaccinationId: number) => {
    setSelectedVaccinationId(vaccinationId);
    setOpenDeleteDialog(true);
  };

  const handleCloseDialogs = () => {
    setOpenAddDialog(false);
    setOpenDeleteDialog(false);
    clearError();
  };

  // Handle select changes specifically for Material UI's Select component
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    if (name) {
      if (name === 'driveId' && parseInt(value) > 0) {
        const selectedDrive = drives.find(drive => drive.id === parseInt(value));
        if (selectedDrive && selectedDrive.applicableClasses) {
          const classes = selectedDrive.applicableClasses.split(',').map(c => c.trim());
          setEligibleClasses(classes);
          // Filter students based on eligible classes
          const eligible = students.filter(student =>
            classes.includes(student.class)
          );
          setFilteredStudents(eligible);
        } else {
          setEligibleClasses([]);
          setFilteredStudents([]);
        }
        // Reset studentId when changing drive
        setFormData(prev => ({
          ...prev,
          [name]: parseInt(value) || 0,
          studentId: 0
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: name === 'studentId' || name === 'driveId' ? parseInt(value) || 0 : value
        }));
      }
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFormData(prev => ({ ...prev, vaccinationDate: date }));
    }
  };

  // Handle pagination changes
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Toggle filter section
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Clear filters
  const clearFilters = () => {
    setStudentIdFilter('');
    setDriveIdFilter('');
    setVaccineNameFilter('');
  };

  // Update filter text fields to use handleInputChange
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'studentIdFilter') {
      setStudentIdFilter(value);
    } else if (name === 'vaccineNameFilter') {
      setVaccineNameFilter(value);
    }
  };

  // Handle form submissions
  const handleAddVaccination = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearError();

    if (formData.studentId === 0 || formData.driveId === 0) {
      setModalError('Please select both a student and a vaccination drive.');
      return;
    }

    // Validate that the selected drive has available doses
    const selectedDrive = drives.find(drive => drive.id === formData.driveId);
    if (!selectedDrive) {
      setModalError('Selected vaccination drive not found.');
      return;
    }

    if (!selectedDrive.availableDoses || selectedDrive.availableDoses <= 0) {
      setModalError('The selected vaccination drive has no available doses.');
      return;
    }

    // Check if the drive date is in the past
    const driveDate = new Date(selectedDrive.date);
    if (driveDate < new Date()) {
      setModalError('Cannot record vaccinations for past drives.');
      return;
    }

    try {
      setLoading(true);
      const vaccinationData: VaccinationCreateRequest = {
        studentId: formData.studentId,
        driveId: formData.driveId,
        vaccinationDate: formData.vaccinationDate.toISOString()
      };

      await createVaccination(vaccinationData);
      handleCloseDialogs();
      fetchVaccinations();
      showNotification('Vaccination recorded successfully', 'success');
    } catch (err: unknown) {
      console.error('Error recording vaccination:', err);

      // Show generic error in snackbar
      showNotification('Failed to record vaccination', 'error');

      // Show detailed error in modal
      if (err && typeof err === 'object' && 'response' in err &&
        err.response && typeof err.response === 'object' &&
        'data' in err.response && err.response.data &&
        typeof err.response.data === 'object' &&
        'message' in err.response.data) {
        setModalError(err.response.data.message as string);
      } else {
        setModalError('Failed to record vaccination. The student might already be vaccinated in this drive.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVaccination = async () => {
    if (!selectedVaccinationId) return;

    try {
      setLoading(true);
      await deleteVaccination(selectedVaccinationId);
      handleCloseDialogs();
      fetchVaccinations();
      showNotification('Vaccination record deleted successfully', 'success');
    } catch (err: unknown) {
      console.error('Error deleting vaccination record:', err);

      // Show generic error in snackbar
      showNotification('Failed to delete vaccination record', 'error');

      // Show detailed error in modal
      if (err && typeof err === 'object' && 'response' in err &&
        err.response && typeof err.response === 'object' &&
        'data' in err.response && err.response.data &&
        typeof err.response.data === 'object' &&
        'message' in err.response.data) {
        setModalError(err.response.data.message as string);
      } else {
        setModalError('Failed to delete vaccination record.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleNextStep = () => {
    if (currentStep === 1 && formData.driveId > 0) {
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  // Handle sort change
  const handleSortChange = (field: string, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
  };

  // Apply sorting to the vaccinations data
  const sortedVaccinations = useMemo(() => {
    const sorted = [...vaccinations];

    sorted.sort((a, b) => {
      let comparison = 0;

      if (sortField === 'studentName') {
        comparison = (a.Student?.name || '').localeCompare(b.Student?.name || '');
      } else if (sortField === 'studentId') {
        comparison = (a.Student?.studentId || '').localeCompare(b.Student?.studentId || '');
      } else if (sortField === 'class') {
        comparison = (a.Student?.class || '').localeCompare(b.Student?.class || '');
      } else if (sortField === 'vaccineName') {
        comparison = (a.VaccinationDrive?.name || '').localeCompare(b.VaccinationDrive?.name || '');
      } else if (sortField === 'vaccinationDate') {
        const dateA = new Date(a.vaccinationDate).getTime();
        const dateB = new Date(b.vaccinationDate).getTime();
        comparison = dateA - dateB;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [vaccinations, sortField, sortDirection]);

  // Define columns for the SortableTable
  const columns: Column<Vaccination>[] = [
    {
      id: 'studentName',
      label: 'Student',
      sortable: true,
      render: (row) => row.Student?.name || 'Unknown'
    },
    {
      id: 'studentId',
      label: 'Student ID',
      sortable: true,
      render: (row) => row.Student?.studentId || 'Unknown'
    },
    {
      id: 'class',
      label: 'Class',
      sortable: true,
      render: (row) => <Chip label={row.Student?.class || 'Unknown'} size="small" />
    },
    {
      id: 'vaccineName',
      label: 'Vaccine',
      sortable: true,
      render: (row) => row.VaccinationDrive?.name || 'Unknown'
    },
    {
      id: 'vaccinationDate',
      label: 'Vaccination Date',
      sortable: true,
      render: (row) => formatDate(row.vaccinationDate)
    },
    {
      id: 'actions',
      label: 'Actions',
      sortable: false,
      render: (row) => (
        <IconButton
          color="error"
          onClick={() => handleOpenDeleteDialog(row.id)}
        >
          <DeleteIcon />
        </IconButton>
      )
    }
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Vaccination Records
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={toggleFilters}
            sx={{ mr: 1 }}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
          >
            Record Vaccination
          </Button>
        </Box>
      </Box>

      {pageError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {pageError}
        </Alert>
      )}

      {/* Filters Section */}
      {showFilters && (
        <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Filters</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                name="studentIdFilter"
                label="Student ID"
                value={studentIdFilter}
                size="small"
                onChange={handleFilterChange}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Vaccination Drive</InputLabel>
                <Select
                  value={driveIdFilter}
                  onChange={(e) => setDriveIdFilter(e.target.value as number)}
                  label="Vaccination Drive"
                  size="small"
                >
                  <MenuItem value="">All Drives</MenuItem>
                  {drives.map(drive => {
                    const driveDate = new Date(drive.date);
                    const today = new Date();
                    const isPastDrive = driveDate < today;
                    const isCompleted = isPastDrive || drive.availableDoses <= 0;

                    return (
                      <MenuItem
                        key={drive.id}
                        value={drive.id}
                        disabled={isCompleted}
                      >
                        {drive.name} ({formatDate(drive.date)}) - Classes: {drive.applicableClasses}
                        {isCompleted && " (Completed)"}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                name="vaccineNameFilter"
                label="Vaccine Name"
                value={vaccineNameFilter}
                onChange={handleFilterChange}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Vaccinations Table */}
      {loading && vaccinations.length === 0 ? (
        <LoadingSpinner message="Loading vaccination records..." />
      ) : (
        <SortableTable
          columns={columns}
          data={sortedVaccinations}
          keyExtractor={(vaccination) => vaccination.id}
          sortField={sortField}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          loading={loading}
          emptyMessage="No vaccination records found"
        />
      )}

      {/* Add Vaccination Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
        <form onSubmit={handleAddVaccination}>
          <DialogTitle>Record New Vaccination - Step {currentStep} of 2</DialogTitle>
          <DialogContent>
            <ModalErrorAlert error={modalError} />

            {currentStep === 1 ? (
              <>
                <DialogContentText sx={{ mb: 2 }}>
                  Step 1: Select a vaccination drive to record a vaccination.
                </DialogContentText>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth margin="dense">
                      <InputLabel>Vaccination Drive</InputLabel>
                      <Select
                        name="driveId"
                        value={String(formData.driveId)}
                        onChange={handleSelectChange}
                        label="Vaccination Drive"
                        required
                      >
                        <MenuItem value="0" disabled>Select a vaccination drive</MenuItem>
                        {drives.map(drive => {
                          const driveDate = new Date(drive.date);
                          const today = new Date();
                          const isPastDrive = driveDate < today;
                          const isCompleted = isPastDrive || drive.availableDoses <= 0;

                          return (
                            <MenuItem
                              key={drive.id}
                              value={String(drive.id)}
                              disabled={isCompleted}
                            >
                              {drive.name} ({formatDate(drive.date)}) - Classes: {drive.applicableClasses}
                              {isCompleted && " (Completed)"}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>
                  </Grid>

                  {formData.driveId > 0 && (
                    <Grid item xs={12}>
                      <Alert severity="info">
                        This vaccination drive is for students in classes: {eligibleClasses.join(', ')}
                      </Alert>
                    </Grid>
                  )}
                </Grid>
              </>
            ) : (
              <>
                <DialogContentText sx={{ mb: 2 }}>
                  Step 2: Select a student from the eligible classes and set the vaccination date.
                </DialogContentText>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth margin="dense">
                      <InputLabel>Student</InputLabel>
                      <Select
                        name="studentId"
                        value={String(formData.studentId)}
                        onChange={handleSelectChange}
                        label="Student"
                        required
                      >
                        <MenuItem value="0" disabled>Select a student</MenuItem>
                        {filteredStudents.length > 0 ? (
                          filteredStudents.map(student => (
                            <MenuItem key={student.id} value={String(student.id)}>
                              {student.name} ({student.studentId}, Class {student.class})
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem value="0" disabled>No eligible students found</MenuItem>
                        )}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="Vaccination Date"
                        value={formData.vaccinationDate}
                        onChange={handleDateChange}
                        disableFuture
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            margin: 'dense'
                          }
                        }}
                      />
                    </LocalizationProvider>
                  </Grid>
                </Grid>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialogs}>Cancel</Button>
            {currentStep === 2 && (
              <Button onClick={handlePrevStep}>Back</Button>
            )}
            {currentStep === 1 ? (
              <Button
                onClick={handleNextStep}
                variant="contained"
                disabled={formData.driveId === 0}
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                variant="contained"
                disabled={loading || formData.studentId === 0}
              >
                {loading ? 'Saving...' : 'Record Vaccination'}
              </Button>
            )}
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDialogs}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <ModalErrorAlert error={modalError} />
          <DialogContentText>
            Are you sure you want to delete this vaccination record? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button onClick={handleDeleteVaccination} color="error" variant="contained" disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Vaccinations; 