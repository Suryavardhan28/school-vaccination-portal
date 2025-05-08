import { useState, useEffect, useMemo, FormEvent, ChangeEvent } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Alert,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  SelectChangeEvent,
  InputAdornment
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  ArrowDropDown as ArrowDropDownIcon,
  ArrowDropUp as ArrowDropUpIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import {
  getVaccinationDrives,
  getVaccinationDriveById,
  createVaccinationDrive,
  updateVaccinationDrive,
  deleteVaccinationDrive,
  VaccinationDrive
} from '../services/vaccinationDriveService';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNotification } from '../contexts/NotificationContext';
import useModalError from '../hooks/useModalError';
import ModalErrorAlert from '../components/ModalErrorAlert';

// Get today's date at midnight
const today = new Date();
today.setHours(0, 0, 0, 0);

// Get the date 15 days from now
const minDriveDate = new Date(today);
minDriveDate.setDate(today.getDate() + 15);

const VaccinationDrives = () => {
  // State for drives list
  const [drives, setDrives] = useState<VaccinationDrive[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Filter state
  const [upcomingOnly, setUpcomingOnly] = useState(false);

  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    date: new Date(minDriveDate),
    availableDoses: 0,
    applicableClasses: ''
  });
  const [formErrors, setFormErrors] = useState({
    name: '',
    date: '',
    availableDoses: '',
    applicableClasses: ''
  });
  const [selectedDriveId, setSelectedDriveId] = useState<number | null>(null);

  // Add notification hook
  const { showNotification } = useNotification();

  // Add modal error handling
  const { error: modalError, setModalError, clearError } = useModalError();

  // Add sort state
  const [sortField, setSortField] = useState<string>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Add additional filter states
  const [nameFilter, setNameFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Load drives on initial render and when filters/pagination change
  useEffect(() => {
    fetchDrives();
  }, [page, rowsPerPage, upcomingOnly, nameFilter, classFilter, statusFilter]);

  const fetchDrives = async () => {
    try {
      setLoading(true);
      setPageError(null);

      // Get all drives initially
      const response = await getVaccinationDrives(page + 1, rowsPerPage, upcomingOnly);

      // Add a note to the drives about the 30-day limit if the filter is on
      let drives = response.vaccinationDrives;

      // Apply client-side filters that aren't handled by the API
      if (nameFilter) {
        drives = drives.filter(drive =>
          drive.name.toLowerCase().includes(nameFilter.toLowerCase())
        );
      }

      if (classFilter) {
        drives = drives.filter(drive =>
          drive.applicableClasses.split(',').some(cls =>
            cls.trim().toLowerCase().includes(classFilter.toLowerCase())
          )
        );
      }

      if (statusFilter === 'past') {
        drives = drives.filter(drive => {
          const driveDate = new Date(drive.date);
          return driveDate < today;
        });
      } else if (statusFilter === 'upcoming') {
        drives = drives.filter(drive => {
          const driveDate = new Date(drive.date);
          return driveDate >= today;
        });
      }

      setDrives(drives);
      // Use local count for pagination if we're filtering client-side
      if (nameFilter || classFilter || statusFilter !== 'all') {
        setTotalCount(drives.length);
      } else {
        setTotalCount(response.total);
      }
    } catch (err) {
      console.error('Error fetching vaccination drives:', err);
      setPageError('Failed to load vaccination drives. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle dialog open/close
  const handleOpenAddDialog = () => {
    setFormData({
      name: '',
      date: new Date(minDriveDate),
      availableDoses: 0,
      applicableClasses: ''
    });
    setFormErrors({
      name: '',
      date: '',
      availableDoses: '',
      applicableClasses: ''
    });
    setOpenAddDialog(true);
  };

  const handleOpenEditDialog = async (driveId: number) => {
    try {
      setLoading(true);
      const drive = await getVaccinationDriveById(driveId);

      setFormData({
        name: drive.name,
        date: new Date(drive.date),
        availableDoses: drive.availableDoses,
        applicableClasses: drive.applicableClasses
      });
      setFormErrors({
        name: '',
        date: '',
        availableDoses: '',
        applicableClasses: ''
      });
      setSelectedDriveId(driveId);
      setOpenEditDialog(true);
    } catch (err) {
      console.error('Error fetching drive details:', err);
      setPageError('Failed to load drive details.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeleteDialog = (driveId: number) => {
    setSelectedDriveId(driveId);
    setOpenDeleteDialog(true);
  };

  const handleCloseDialogs = () => {
    setOpenAddDialog(false);
    setOpenEditDialog(false);
    setOpenDeleteDialog(false);
    clearError(); // Clear modal errors when closing dialogs
  };

  // Handle form input changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<string[]>) => {
    const name = e.target.name as string;
    const value = e.target.value as string[];
    setFormData(prev => ({
      ...prev,
      [name]: Array.isArray(value) ? value.join(',') : value
    }));
    // Clear error
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFormData(prev => ({ ...prev, date }));
      // Clear date error
      if (formErrors.date) {
        setFormErrors(prev => ({ ...prev, date: '' }));
      }
    }
  };

  // Handle pagination changes
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Toggle upcoming filter
  const toggleUpcomingFilter = () => {
    setUpcomingOnly(!upcomingOnly);
    setPage(0); // Reset to first page when filter changes

    // Show a notification to explain the filter
    if (!upcomingOnly) {
      showNotification('Showing drives within the next 30 days only', 'info');
    }
  };

  // Toggle filter visibility
  const toggleFilters = () => {
    setShowFilters(prev => !prev);
  };

  // Add clear filters function
  const clearFilters = () => {
    setNameFilter('');
    setClassFilter('');
    setStatusFilter('all');
    setUpcomingOnly(false);
  };

  // Handle filter input changes
  const handleFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'nameFilter') setNameFilter(value);
    else if (name === 'classFilter') setClassFilter(value);
  };

  // Handle status filter changes
  const handleStatusFilterChange = (e: SelectChangeEvent<string>) => {
    const value = e.target.value as 'all' | 'upcoming' | 'past';
    setStatusFilter(value);

    // If status is 'upcoming' and upcomingOnly is true,
    // don't change upcomingOnly. Otherwise, set it based on the selection.
    if (value === 'upcoming' && !upcomingOnly) {
      setUpcomingOnly(true);
    } else if (value !== 'upcoming' && upcomingOnly) {
      setUpcomingOnly(false);
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {
      name: '',
      date: '',
      availableDoses: '',
      applicableClasses: ''
    };
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = 'Vaccine name is required';
      isValid = false;
    }

    if (!formData.date) {
      errors.date = 'Date is required';
      isValid = false;
    } else if (formData.date < minDriveDate) {
      errors.date = 'Drive must be scheduled at least 15 days in advance';
      isValid = false;
    }

    if (formData.availableDoses <= 0) {
      errors.availableDoses = 'Available doses must be greater than 0';
      isValid = false;
    }

    if (!formData.applicableClasses.trim()) {
      errors.applicableClasses = 'At least one class must be selected';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Handle form submission for adding a new vaccination drive
  const handleAddDrive = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) return;

    try {
      setLoading(true);
      await createVaccinationDrive({
        ...formData,
        date: formData.date.toISOString()
      });
      handleCloseDialogs();
      fetchDrives();
      showNotification('Vaccination drive created successfully', 'success');
    } catch (err: unknown) {
      console.error('Error creating vaccination drive:', err);

      // Show generic error in snackbar
      showNotification('Failed to create vaccination drive', 'error');

      // Show detailed error in modal
      if (err && typeof err === 'object' && 'response' in err &&
        err.response && typeof err.response === 'object' &&
        'data' in err.response && err.response.data &&
        typeof err.response.data === 'object' &&
        'message' in err.response.data) {
        setModalError(err.response.data.message as string);
      } else {
        setModalError('Failed to create vaccination drive.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission for editing a vaccination drive
  const handleEditDrive = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearError();

    if (!validateForm() || !selectedDriveId) return;

    try {
      setLoading(true);
      await updateVaccinationDrive(selectedDriveId, {
        ...formData,
        date: formData.date.toISOString()
      });
      handleCloseDialogs();
      fetchDrives();
      showNotification('Vaccination drive updated successfully', 'success');
    } catch (err: unknown) {
      console.error('Error updating vaccination drive:', err);

      // Show generic error in snackbar
      showNotification('Failed to update vaccination drive', 'error');

      // Show detailed error in modal
      if (err && typeof err === 'object' && 'response' in err &&
        err.response && typeof err.response === 'object' &&
        'data' in err.response && err.response.data &&
        typeof err.response.data === 'object' &&
        'message' in err.response.data) {
        setModalError(err.response.data.message as string);
      } else {
        setModalError('Failed to update vaccination drive.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle deletion of a vaccination drive
  const handleDeleteDrive = async () => {
    if (!selectedDriveId) return;

    try {
      setLoading(true);
      await deleteVaccinationDrive(selectedDriveId);
      handleCloseDialogs();
      fetchDrives();
      showNotification('Vaccination drive deleted successfully', 'success');
    } catch (err: unknown) {
      console.error('Error deleting vaccination drive:', err);

      // Show generic error in snackbar
      showNotification('Failed to delete vaccination drive', 'error');

      // Show detailed error in modal
      if (err && typeof err === 'object' && 'response' in err &&
        err.response && typeof err.response === 'object' &&
        'data' in err.response && err.response.data &&
        typeof err.response.data === 'object' &&
        'message' in err.response.data) {
        setModalError(err.response.data.message as string);
      } else {
        setModalError('Failed to delete vaccination drive.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to determine if a drive is in the past
  const isDrivePast = (driveDate: string) => {
    const date = new Date(driveDate);
    return date < today;
  };

  // Generate class options
  const classOptions = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

  // Add sort handler
  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new field and reset to ascending
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Sort the drives
  const sortedDrives = useMemo(() => {
    const sorted = [...drives];

    sorted.sort((a, b) => {
      let comparison = 0;

      if (sortField === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === "date") {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortField === "availableDoses") {
        comparison = a.availableDoses - b.availableDoses;
      } else if (sortField === "applicableClasses") {
        comparison = a.applicableClasses.localeCompare(b.applicableClasses);
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [drives, sortField, sortDirection]);

  // Create a reusable TableSortLabel component
  const TableSortLabel = ({ label, field }: { label: string, field: string }) => {
    const isActive = sortField === field;

    return (
      <Box
        onClick={() => handleSort(field)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          userSelect: 'none',
          fontWeight: 'bold',
          color: isActive ? 'primary.main' : 'inherit'
        }}
      >
        {label}
        {isActive ? (
          sortDirection === 'asc' ?
            <ArrowDropUpIcon color="primary" /> :
            <ArrowDropDownIcon color="primary" />
        ) : (
          <ArrowDropDownIcon sx={{ opacity: 0.3 }} />
        )}
      </Box>
    );
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Vaccination Drives
        </Typography>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={showFilters ? <ClearIcon /> : <FilterListIcon />}
            onClick={toggleFilters}
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
          >
            Schedule New Drive
          </Button>
        </Box>
      </Box>

      {pageError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {pageError}
        </Alert>
      )}

      {/* Filter Section */}
      {showFilters && (
        <Paper elevation={3} sx={{ p: 2, mb: 3 }}>

          <Typography variant="h6" gutterBottom>Filters</Typography>

          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                name="nameFilter"
                label="Search by Vaccine Name"
                variant="outlined"
                size="small"
                value={nameFilter}
                onChange={handleFilterChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                name="classFilter"
                label="Search by Class"
                variant="outlined"
                size="small"
                value={classFilter}
                onChange={handleFilterChange}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={handleStatusFilterChange}
                >
                  <MenuItem value="all">All Drives</MenuItem>
                  <MenuItem value="upcoming">Upcoming Drives</MenuItem>
                  <MenuItem value="past">Past Drives</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={3}>
              <Box display="flex" gap={1}>
                <Button
                  fullWidth
                  variant={upcomingOnly ? "contained" : "outlined"}
                  onClick={toggleUpcomingFilter}
                  startIcon={<EventIcon />}
                  size="medium"
                >
                  Next 30 Days
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={clearFilters}
                  disabled={!nameFilter && !classFilter && statusFilter === 'all' && !upcomingOnly}
                  size="medium"
                >
                  Clear
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {loading && drives.length === 0 ? (
        <LoadingSpinner message="Loading vaccination drives..." />
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel label="Name" field="name" />
                  </TableCell>
                  <TableCell>
                    <TableSortLabel label="Date" field="date" />
                  </TableCell>
                  <TableCell>
                    <TableSortLabel label="Available Doses" field="availableDoses" />
                  </TableCell>
                  <TableCell>
                    <TableSortLabel label="Applicable Classes" field="applicableClasses" />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedDrives.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No vaccination drives found
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedDrives.map(drive => {
                    const isPast = isDrivePast(drive.date);

                    return (
                      <TableRow key={drive.id}>
                        <TableCell>{drive.name}</TableCell>
                        <TableCell>{new Date(drive.date).toLocaleDateString()}</TableCell>
                        <TableCell>{drive.availableDoses}</TableCell>
                        <TableCell>
                          {drive.applicableClasses.split(',').map(cls => (
                            <Chip
                              key={cls}
                              label={`Class ${cls.trim()}`}
                              size="small"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={isPast ? "Completed" : "Upcoming"}
                            color={isPast ? "default" : "success"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenEditDialog(drive.id)}
                            disabled={isPast}
                            title={isPast ? "Cannot edit past drives" : "Edit drive"}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleOpenDeleteDialog(drive.id)}
                            disabled={isPast}
                            title={isPast ? "Cannot delete past drives" : "Delete drive"}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
                {loading && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <LoadingSpinner />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </>
      )}

      {/* Add Drive Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseDialogs} maxWidth="md" fullWidth>
        <form onSubmit={handleAddDrive}>
          <DialogTitle>Schedule New Vaccination Drive</DialogTitle>
          <DialogContent>
            <ModalErrorAlert error={modalError} />
            <DialogContentText sx={{ mb: 2 }}>
              Schedule a new vaccination drive. Drives must be scheduled at least 15 days in advance.
            </DialogContentText>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  autoFocus
                  margin="dense"
                  name="name"
                  label="Vaccine Name"
                  type="text"
                  fullWidth
                  variant="outlined"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Drive Date"
                    value={formData.date}
                    onChange={handleDateChange}
                    disablePast
                    minDate={minDriveDate}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        margin: 'dense',
                        error: !!formErrors.date,
                        helperText: formErrors.date
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  margin="dense"
                  name="availableDoses"
                  label="Available Doses"
                  type="number"
                  fullWidth
                  variant="outlined"
                  required
                  value={formData.availableDoses}
                  onChange={handleInputChange}
                  InputProps={{ inputProps: { min: 1 } }}
                  error={!!formErrors.availableDoses}
                  helperText={formErrors.availableDoses}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth error={!!formErrors.applicableClasses}>
                  <InputLabel id="applicable-classes-label">Applicable Classes</InputLabel>
                  <Select
                    labelId="applicable-classes-label"
                    multiple
                    name="applicableClasses"
                    value={formData.applicableClasses ? formData.applicableClasses.split(',') : []}
                    onChange={handleSelectChange}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as string[]).map((value) => (
                          <Chip key={value} label={`Class ${value}`} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {classOptions.map((cls) => (
                      <MenuItem key={cls} value={cls}>
                        Class {cls}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.applicableClasses && (
                    <FormHelperText>{formErrors.applicableClasses}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialogs}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Scheduling...' : 'Schedule Drive'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Drive Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseDialogs} maxWidth="md" fullWidth>
        <form onSubmit={handleEditDrive}>
          <DialogTitle>Edit Vaccination Drive</DialogTitle>
          <DialogContent>
            <ModalErrorAlert error={modalError} />
            <DialogContentText sx={{ mb: 2 }}>
              Update the vaccination drive details. Drives must be scheduled at least 15 days in advance.
            </DialogContentText>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  autoFocus
                  margin="dense"
                  name="name"
                  label="Vaccine Name"
                  type="text"
                  fullWidth
                  variant="outlined"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Drive Date"
                    value={formData.date}
                    onChange={handleDateChange}
                    disablePast
                    minDate={minDriveDate}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        margin: 'dense',
                        error: !!formErrors.date,
                        helperText: formErrors.date
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  margin="dense"
                  name="availableDoses"
                  label="Available Doses"
                  type="number"
                  fullWidth
                  variant="outlined"
                  required
                  value={formData.availableDoses}
                  onChange={handleInputChange}
                  InputProps={{ inputProps: { min: 1 } }}
                  error={!!formErrors.availableDoses}
                  helperText={formErrors.availableDoses}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth error={!!formErrors.applicableClasses}>
                  <InputLabel id="edit-applicable-classes-label">Applicable Classes</InputLabel>
                  <Select
                    labelId="edit-applicable-classes-label"
                    multiple
                    name="applicableClasses"
                    value={formData.applicableClasses ? formData.applicableClasses.split(',') : []}
                    onChange={handleSelectChange}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as string[]).map((value) => (
                          <Chip key={value} label={`Class ${value}`} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {classOptions.map((cls) => (
                      <MenuItem key={cls} value={cls}>
                        Class {cls}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.applicableClasses && (
                    <FormHelperText>{formErrors.applicableClasses}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialogs}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDialogs}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <ModalErrorAlert error={modalError} />
          <DialogContentText>
            Are you sure you want to delete this vaccination drive? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button onClick={handleDeleteDrive} color="error" variant="contained" disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VaccinationDrives; 