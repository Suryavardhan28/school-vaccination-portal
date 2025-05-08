import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
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
  InputAdornment,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
  Clear as ClearIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  importStudentsFromCSV,
  Student
} from '../services/studentService';
import { useNotification } from '../contexts/NotificationContext';
import useModalError from '../hooks/useModalError';
import ModalErrorAlert from '../components/ModalErrorAlert';
import SortableTable, { Column, SortDirection } from '../components/SortableTable';

// Add an interface for the CSV import response
interface ImportResponse {
  message: string;
  totalProcessed: number;
  successCount: number;
  errorCount: number;
  errors?: string[];
}

const Students = () => {
  // State for students list
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Search filters
  const [nameFilter, setNameFilter] = useState('');
  const [studentIdFilter, setStudentIdFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');

  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openImportDialog, setOpenImportDialog] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    class: ''
  });
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

  // CSV import state
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportResponse | null>(null);

  // Add notification hook
  const { showNotification } = useNotification();

  // Add modal error handling
  const { error: modalError, setModalError, clearError } = useModalError();

  // Add sort state
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Add showFilters state
  const [showFilters, setShowFilters] = useState(false);

  // Add toggleFilters function
  const toggleFilters = () => {
    setShowFilters(prev => !prev);
  };

  // Define fetchStudents before using it in useEffect
  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);

      // Create search object for API call
      const search = {
        name: nameFilter || undefined,
        studentId: studentIdFilter || undefined,
        class: classFilter || undefined
      };

      const response = await getStudents(page + 1, rowsPerPage, search);

      // If your backend doesn't support sorting, you can sort locally:
      const sortedData = [...response.students];

      sortedData.sort((a, b) => {
        let comparison = 0;

        if (sortField === 'name') {
          comparison = a.name.localeCompare(b.name);
        } else if (sortField === 'studentId') {
          comparison = a.studentId.localeCompare(b.studentId);
        } else if (sortField === 'class') {
          comparison = a.class.localeCompare(b.class);
        }

        return sortDirection === 'asc' ? comparison : -comparison;
      });

      setStudents(sortedData);
      setTotalCount(response.total);
    } catch (err) {
      console.error('Failed to fetch students:', err);
      setPageError('Failed to load students. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, nameFilter, studentIdFilter, classFilter, sortField, sortDirection]);

  // Load students on initial render and when filters/pagination change
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Handle dialog open/close
  const handleOpenAddDialog = () => {
    setFormData({ name: '', studentId: '', class: '' });
    setOpenAddDialog(true);
  };

  const handleOpenEditDialog = (student: Student) => {
    setFormData({
      name: student.name,
      studentId: student.studentId,
      class: student.class
    });
    setSelectedStudentId(student.id);
    setOpenEditDialog(true);
  };

  const handleOpenDeleteDialog = (studentId: number) => {
    setSelectedStudentId(studentId);
    setOpenDeleteDialog(true);
  };

  const handleOpenImportDialog = () => {
    setCsvFile(null);
    setImportResult(null);
    setOpenImportDialog(true);
  };

  const handleCloseDialogs = () => {
    setOpenAddDialog(false);
    setOpenEditDialog(false);
    setOpenDeleteDialog(false);
    setOpenImportDialog(false);
    clearError();
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle pagination changes
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle search filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'nameFilter') setNameFilter(value);
    else if (name === 'studentIdFilter') setStudentIdFilter(value);
    else if (name === 'classFilter') setClassFilter(value);
  };

  const clearFilters = () => {
    setNameFilter('');
    setStudentIdFilter('');
    setClassFilter('');
  };

  // Handle CSV file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCsvFile(e.target.files[0]);
    }
  };

  // Handle form submissions
  const handleAddStudent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearError();

    try {
      setLoading(true);
      await createStudent(formData);
      handleCloseDialogs();
      fetchStudents();
      showNotification('Student added successfully', 'success');
    } catch (err: unknown) {
      console.error('Error adding student:', err);

      // Show generic error in snackbar
      showNotification('Failed to add student', 'error');

      // Show detailed error in modal
      if (err && typeof err === 'object' && 'response' in err &&
        err.response && typeof err.response === 'object' &&
        'data' in err.response && err.response.data &&
        typeof err.response.data === 'object' &&
        'message' in err.response.data) {
        setModalError(err.response.data.message as string);
      } else {
        setModalError('Failed to add student.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditStudent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearError();

    if (!selectedStudentId) return;

    try {
      setLoading(true);
      await updateStudent(selectedStudentId, formData);
      handleCloseDialogs();
      fetchStudents();
      showNotification('Student updated successfully', 'success');
    } catch (err: unknown) {
      console.error('Error updating student:', err);

      // Show generic error in snackbar
      showNotification('Failed to update student', 'error');

      // Show detailed error in modal
      if (err && typeof err === 'object' && 'response' in err &&
        err.response && typeof err.response === 'object' &&
        'data' in err.response && err.response.data &&
        typeof err.response.data === 'object' &&
        'message' in err.response.data) {
        setModalError(err.response.data.message as string);
      } else {
        setModalError('Failed to update student.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!selectedStudentId) return;

    try {
      setLoading(true);
      await deleteStudent(selectedStudentId);
      handleCloseDialogs();
      fetchStudents();
      showNotification('Student deleted successfully', 'success');
    } catch (err: unknown) {
      console.error('Error deleting student:', err);

      // Show generic error in snackbar
      showNotification('Failed to delete student', 'error');

      // Show detailed error in modal
      if (err && typeof err === 'object' && 'response' in err &&
        err.response && typeof err.response === 'object' &&
        'data' in err.response && err.response.data &&
        typeof err.response.data === 'object' &&
        'message' in err.response.data) {
        setModalError(err.response.data.message as string);
      } else {
        setModalError('Failed to delete student.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImportCSV = async () => {
    if (!csvFile) return;

    try {
      setLoading(true);
      const response = await importStudentsFromCSV(csvFile);
      setCsvFile(null);

      // For imports, keep the detailed success information in the snackbar
      const successMessage = `Imported ${response.successCount} students successfully. ${response.errorCount > 0 ? `${response.errorCount} errors.` : ''}`;
      showNotification(successMessage, response.errorCount > 0 ? 'warning' : 'success');

      setImportResult(response);
      handleCloseDialogs();
      fetchStudents();
    } catch (err: unknown) {
      console.error('Error importing students:', err);

      // Show generic error in snackbar
      showNotification('Failed to import students', 'error');

      // Show detailed error in modal
      if (err && typeof err === 'object' && 'response' in err &&
        err.response && typeof err.response === 'object' &&
        'data' in err.response && err.response.data &&
        typeof err.response.data === 'object' &&
        'message' in err.response.data) {
        setModalError(err.response.data.message as string);
      } else {
        setModalError('Failed to import students.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle sort change
  const handleSortChange = (field: string, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
  };

  // Define columns for the SortableTable
  const columns: Column<Student>[] = [
    {
      id: 'name',
      label: 'Name',
      sortable: true,
      render: (row) => row.name
    },
    {
      id: 'studentId',
      label: 'Student ID',
      sortable: true,
      render: (row) => row.studentId
    },
    {
      id: 'class',
      label: 'Class',
      sortable: true,
      render: (row) => <Chip label={row.class} size="small" />
    },
    {
      id: 'actions',
      label: 'Actions',
      sortable: false,
      render: (row) => (
        <>
          <IconButton
            color="primary"
            onClick={() => handleOpenEditDialog(row)}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => handleOpenDeleteDialog(row.id)}
          >
            <DeleteIcon />
          </IconButton>
        </>
      )
    }
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Students
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
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={handleOpenImportDialog}
          >
            Import CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
          >
            Add Student
          </Button>
        </Box>
      </Box>

      {pageError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {pageError}
        </Alert>
      )}

      {/* Search filters */}
      {showFilters && (
        <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Filters</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <TextField
                name="nameFilter"
                label="Search by Name"
                variant="outlined"
                size="small"
                fullWidth
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
                name="studentIdFilter"
                label="Search by Student ID"
                variant="outlined"
                size="small"
                fullWidth
                value={studentIdFilter}
                onChange={handleFilterChange}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                name="classFilter"
                label="Search by Class"
                variant="outlined"
                size="small"
                fullWidth
                value={classFilter}
                onChange={handleFilterChange}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button
                fullWidth
                disabled={!nameFilter && !studentIdFilter && !classFilter}
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={clearFilters}
                size="medium"
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}

      {loading && students.length === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" p={4}>
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2 }}>
            Loading students...
          </Typography>
        </Box>
      ) : (
        <SortableTable
          columns={columns}
          data={students}
          keyExtractor={(student) => student.id}
          sortField={sortField}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          loading={loading}
          emptyMessage="No students found"
        />
      )}

      {/* Add Student Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseDialogs}>
        <form onSubmit={handleAddStudent}>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogContent>
            <ModalErrorAlert error={modalError} />
            <DialogContentText sx={{ mb: 2 }}>
              Please fill in the student details below.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Full Name"
              type="text"
              fullWidth
              variant="outlined"
              required
              value={formData.name}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="studentId"
              label="Student ID"
              type="text"
              fullWidth
              variant="outlined"
              required
              value={formData.studentId}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="class"
              label="Class"
              type="text"
              fullWidth
              variant="outlined"
              required
              value={formData.class}
              onChange={handleInputChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialogs}>Cancel</Button>
            <Button type="submit" variant="contained">Add Student</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseDialogs}>
        <form onSubmit={handleEditStudent}>
          <DialogTitle>Edit Student</DialogTitle>
          <DialogContent>
            <ModalErrorAlert error={modalError} />
            <DialogContentText sx={{ mb: 2 }}>
              Update the student details below.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Full Name"
              type="text"
              fullWidth
              variant="outlined"
              required
              value={formData.name}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="studentId"
              label="Student ID"
              type="text"
              fullWidth
              variant="outlined"
              required
              value={formData.studentId}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="class"
              label="Class"
              type="text"
              fullWidth
              variant="outlined"
              required
              value={formData.class}
              onChange={handleInputChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialogs}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Save Changes
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
            Are you sure you want to delete this student? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button onClick={handleDeleteStudent} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import CSV Dialog */}
      <Dialog open={openImportDialog} onClose={handleCloseDialogs}>
        <DialogTitle>Import Students from CSV</DialogTitle>
        <DialogContent>
          <ModalErrorAlert error={modalError} />
          <DialogContentText sx={{ mb: 2 }}>
            Upload a CSV file containing student data. The file should have columns for name, studentId, and class.
          </DialogContentText>

          <input
            accept=".csv"
            style={{ display: 'none' }}
            id="csv-file-input"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="csv-file-input">
            <Button variant="outlined" component="span" startIcon={<UploadIcon />} sx={{ mb: 2 }}>
              Select CSV File
            </Button>
          </label>

          {csvFile && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2">
                Selected file: {csvFile.name}
              </Typography>
            </Box>
          )}

          {importResult && (
            <Box sx={{ mt: 2 }}>
              <Alert
                severity={importResult.errorCount > 0 ? "warning" : "success"}
                sx={{ mb: 1 }}
              >
                Import completed: {importResult.successCount} succeeded, {importResult.errorCount} failed
              </Alert>

              {importResult.errors && importResult.errors.length > 0 && (
                <Box sx={{ mt: 1, maxHeight: '100px', overflow: 'auto' }}>
                  <Typography variant="body2" color="error" gutterBottom>
                    Errors:
                  </Typography>
                  {importResult.errors.map((error: string, index: number) => (
                    <Typography key={index} variant="caption" display="block">
                      • {error}
                    </Typography>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Close</Button>
          <Button
            onClick={handleImportCSV}
            variant="contained"
            disabled={!csvFile || loading}
          >
            {loading ? 'Importing...' : 'Import'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Students; 