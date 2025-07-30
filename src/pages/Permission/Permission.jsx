import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Add as AddIcon, 
  PersonSearch as PersonSearchIcon, 
  Check as CheckIcon, 
  Close as CloseIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Description as DescriptionIcon,
  HowToReg as ApprovedIcon,
  Cancel as RejectedIcon,
  Pending as PendingIcon,
  EventAvailable as EventAvailableIcon,
  EventBusy as EventBusyIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  Chip,
  Divider,
  Grid,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
  Typography,
  TextField,
  Avatar,
  styled,
  Tooltip
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAuth } from '../../context/Authcontext';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5042/api';
const permissionApi = axios.create({ baseURL: `${API_BASE_URL}/Permission` });
const employeeApi = axios.create({ baseURL: `${API_BASE_URL}/Employee` });

// Styled Components
const GradientCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(31, 38, 135, 0.1)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  overflow: 'hidden',
}));

const StatusBadge = styled(Chip)(({ theme, status }) => ({
  fontWeight: 600,
  textTransform: 'uppercase',
  fontSize: '0.7rem',
  padding: theme.spacing(0.5),
  ...(status === 'Approved' && {
    backgroundColor: 'rgba(46, 204, 113, 0.2)',
    color: '#2ecc71',
  }),
  ...(status === 'Rejected' && {
    backgroundColor: 'rgba(231, 76, 60, 0.2)',
    color: '#e74c3c',
  }),
  ...(status === 'Pending' && {
    backgroundColor: 'rgba(241, 196, 15, 0.2)',
    color: '#f1c40f',
  }),
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  padding: theme.spacing(1, 2),
  textTransform: 'none',
  fontWeight: 600,
  transition: 'all 0.3s ease',
  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
}));

const ModalBox = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '500px',
  backgroundColor: theme.palette.background.paper,
  borderRadius: '16px',
  boxShadow: theme.shadows[10],
  padding: theme.spacing(4),
  outline: 'none',
}));

const mapStatus = (code) => {
  switch (code) {
    case 0: return 'Pending';
    case 1: return 'Approved';
    case 2: return 'Rejected';
    default: return 'Unknown';
  }
};

const formatDate = (iso) => {
  if (!iso) return 'N/A';
  const d = new Date(iso);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function PermissionPage() {
  const { authenticated, user } = useAuth();
  const navigate = useNavigate();
  const [permissions, setPermissions] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [openRequestModal, setOpenRequestModal] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);

  const [requestForm, setRequestForm] = useState({
    reason: '',
    beginDate: new Date(),
    endDate: new Date()
  });

  const [createForm, setCreateForm] = useState({
    targetEmployeeId: '',
    reason: '',
    beginDate: new Date(),
    endDate: new Date()
  });

  const getAuthToken = () => localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = getAuthToken();
        const [permsRes, empsRes] = await Promise.all([
          permissionApi.get('/MyPermissions', { headers: { Authorization: `Bearer ${token}` } }),
          employeeApi.get('/GetAllEmployees', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        const empList = Array.isArray(empsRes.data) ? empsRes.data : [];
        const perms = Array.isArray(permsRes.data) ? permsRes.data : [];
        const enriched = perms.map(p => {
          const requester = empList.find(e => e.id === p.requesterId) || {};
          const target = empList.find(e => e.id === p.targetEmployeeId) || {};
          return {
            ...p,
            statusText: mapStatus(p.status),
            requesterName: `${requester.firstName || ''} ${requester.lastName || ''}`.trim(),
            targetName: `${target.firstName || ''} ${target.lastName || ''}`.trim()
          };
        });
        setEmployees(empList);
        setPermissions(enriched);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to fetch data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (authenticated) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [authenticated]);

  const refresh = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const res = await permissionApi.get('/MyPermissions', { headers: { Authorization: `Bearer ${token}` } });
      const perms = Array.isArray(res.data) ? res.data : [];
      const enriched = perms.map(p => {
        const requester = employees.find(e => e.id === p.requesterId) || {};
        const target = employees.find(e => e.id === p.targetEmployeeId) || {};
        return {
          ...p,
          statusText: mapStatus(p.status),
          requesterName: `${requester.firstName || ''} ${requester.lastName || ''}`.trim(),
          targetName: `${target.firstName || ''} ${target.lastName || ''}`.trim()
        };
      });
      setPermissions(enriched);
    } catch {
      setError('Failed to refresh data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = getAuthToken();
      await permissionApi.post('/RequestToBoss', requestForm, { headers: { Authorization: `Bearer ${token}` } });
      setSuccess('Permission request submitted successfully!');
      setOpenRequestModal(false);
      await refresh();
    } catch {
      setError('Failed to submit request. Please try again.');
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = getAuthToken();
      const payload = {
        targetEmployeeId: createForm.targetEmployeeId,
        reason: createForm.reason,
        beginDate: createForm.beginDate.toISOString(),
        endDate: createForm.endDate.toISOString()
      };
      await permissionApi.post('/CreateForEmployee', payload, { headers: { Authorization: `Bearer ${token}` } });
      setSuccess('Permission created successfully!');
      setOpenCreateModal(false);
      setCreateForm({
        targetEmployeeId: '',
        reason: '',
        beginDate: new Date(),
        endDate: new Date()
      });
      await refresh();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create permission. Please try again.');
    }
  };

  const handleStatusChange = async (id, code) => {
    try {
      const token = getAuthToken();
      await permissionApi.put(`/${id}/status?status=${code}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setSuccess(`Permission ${mapStatus(code).toLowerCase()} successfully!`);
      await refresh();
    } catch {
      setError('Failed to update status. Please try again.');
    }
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(null);
  };

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  if (!authenticated && !loading) return (
    <Box 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      minHeight="80vh"
      textAlign="center"
    >
      <Typography variant="h6" color="textSecondary">
        Please log in to view permissions.
      </Typography>
    </Box>
  );

  const allPermissions = permissions;
  const pending = permissions.filter(p => p.statusText === 'Pending');

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ 
        p: 4, 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
        minHeight: '100vh'
      }}>
        {/* Background decorative elements */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(100,115,255,0.1) 0%, rgba(0,0,0,0) 70%)',
          zIndex: 0
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(255,100,100,0.1) 0%, rgba(0,0,0,0) 70%)',
          zIndex: 0
        }} />

        <Box position="relative" zIndex={1}>
          {/* Header Section */}
          <Box sx={{ mb: 4 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar sx={{ 
                bgcolor: 'primary.main', 
                mr: 2,
                width: 56, 
                height: 56 
              }}>
                <EventAvailableIcon fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="h3" sx={{ 
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #3f51b5 30%, #2196f3 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Permission Management
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">
                  Manage and track employee permissions and requests
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ mb: 4 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <ActionButton
                  fullWidth
                  variant="contained"
                  startIcon={<DashboardIcon />}
                  onClick={handleDashboardClick}
                  sx={{
                    background: 'linear-gradient(45deg, #9C27B0 30%, #E91E63 90%)',
                    color: 'white',
                    height: '56px'
                  }}
                >
                  Back to Dashboard
                </ActionButton>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <ActionButton
                  fullWidth
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenRequestModal(true)}
                  sx={{
                    background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)',
                    color: 'white',
                    height: '56px'
                  }}
                >
                  Request Permission
                </ActionButton>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <ActionButton
                  fullWidth
                  variant="contained"
                  startIcon={<PersonSearchIcon />}
                  onClick={() => setOpenCreateModal(true)}
                  sx={{
                    background: 'linear-gradient(45deg, #2196F3 30%, #03A9F4 90%)',
                    color: 'white',
                    height: '56px'
                  }}
                >
                  Create for Employee
                </ActionButton>
              </Grid>
            </Grid>
          </Box>

          {/* Tabs */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ 
              display: 'flex', 
              borderBottom: 1, 
              borderColor: 'divider',
              '& button': {
                borderRadius: '8px 8px 0 0',
                mx: 0.5,
                px: 3,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.9375rem'
              }
            }}>
              <Button 
                onClick={() => setActiveTab('all')} 
                sx={{
                  color: activeTab === 'all' ? 'primary.main' : 'text.secondary',
                  bgcolor: activeTab === 'all' ? 'rgba(63, 81, 181, 0.08)' : 'transparent',
                }}
              >
                All Permissions
                <Chip 
                  label={allPermissions.length} 
                  size="small" 
                  sx={{ 
                    ml: 1, 
                    bgcolor: activeTab === 'all' ? 'primary.light' : 'grey.300',
                    color: activeTab === 'all' ? 'primary.contrastText' : 'text.primary'
                  }} 
                />
              </Button>
              <Button 
                onClick={() => setActiveTab('pending')} 
                disabled={!pending.length}
                sx={{
                  color: activeTab === 'pending' ? 'warning.main' : 'text.secondary',
                  bgcolor: activeTab === 'pending' ? 'rgba(255, 152, 0, 0.08)' : 'transparent',
                }}
              >
                Pending Approvals
                <Chip 
                  label={pending.length} 
                  size="small" 
                  sx={{ 
                    ml: 1, 
                    bgcolor: activeTab === 'pending' ? 'warning.light' : 'grey.300',
                    color: activeTab === 'pending' ? 'warning.contrastText' : 'text.primary'
                  }} 
                />
              </Button>
            </Box>
          </Box>

          {/* Content */}
          <GradientCard>
            {loading ? (
              <Box display="flex" justifyContent="center" py={8}>
                <CircularProgress size={60} thickness={4} sx={{ color: 'primary.main' }} />
              </Box>
            ) : (
              <TableContainer>
                <Table sx={{ minWidth: 750 }}>
                  <TableHead sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)' }}>
                    <TableRow>
                      {activeTab === 'all' ? (
                        <>
                          <TableCell sx={{ fontWeight: 700 }}>Requester</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Target</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Reason</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Period</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Created</TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell sx={{ fontWeight: 700 }}>Requester</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Target</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Reason</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Period</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Created</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                        </>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activeTab === 'all' ? (
                      allPermissions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                            <Typography color="textSecondary">
                              No permission records found
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        allPermissions.map(p => (
                          <TableRow 
                            key={p.id} 
                            hover
                            sx={{ '&:last-child td': { borderBottom: 0 } }}
                          >
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <Avatar sx={{ 
                                  bgcolor: 'primary.light', 
                                  color: 'primary.main',
                                  width: 32, 
                                  height: 32, 
                                  mr: 2,
                                  fontSize: '0.875rem'
                                }}>
                                  {p.requesterName ? p.requesterName.charAt(0) : '?'}
                                </Avatar>
                                {p.requesterName || p.requesterId}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <Avatar sx={{ 
                                  bgcolor: 'secondary.light', 
                                  color: 'secondary.main',
                                  width: 32, 
                                  height: 32, 
                                  mr: 2,
                                  fontSize: '0.875rem'
                                }}>
                                  {p.targetName ? p.targetName.charAt(0) : '?'}
                                </Avatar>
                                {p.targetName || p.targetEmployeeId}
                              </Box>
                            </TableCell>
                            <TableCell sx={{ maxWidth: 300 }}>
                              <Tooltip title={p.reason} placement="top" arrow>
                                <Typography 
                                  sx={{ 
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {p.reason}
                                </Typography>
                              </Tooltip>
                            </TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <EventAvailableIcon color="action" fontSize="small" sx={{ mr: 1 }} />
                                <Typography variant="body2">
                                  {formatDate(p.beginDate)}
                                </Typography>
                              </Box>
                              <Box display="flex" alignItems="center">
                                <EventBusyIcon color="action" fontSize="small" sx={{ mr: 1 }} />
                                <Typography variant="body2">
                                  {formatDate(p.endDate)}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <StatusBadge 
                                label={p.statusText} 
                                status={p.statusText}
                                icon={
                                  p.statusText === 'Approved' ? <ApprovedIcon fontSize="small" /> :
                                  p.statusText === 'Rejected' ? <RejectedIcon fontSize="small" /> :
                                  <PendingIcon fontSize="small" />
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {formatDate(p.createdAt)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))
                      )
                    ) : (
                      pending.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                            <Typography color="textSecondary">
                              No pending permissions to approve
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        pending.map(p => (
                          <TableRow 
                            key={p.id} 
                            hover
                            sx={{ '&:last-child td': { borderBottom: 0 } }}
                          >
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <Avatar sx={{ 
                                  bgcolor: 'primary.light', 
                                  color: 'primary.main',
                                  width: 32, 
                                  height: 32, 
                                  mr: 2,
                                  fontSize: '0.875rem'
                                }}>
                                  {p.requesterName ? p.requesterName.charAt(0) : '?'}
                                </Avatar>
                                {p.requesterName || p.requesterId}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <Avatar sx={{ 
                                  bgcolor: 'secondary.light', 
                                  color: 'secondary.main',
                                  width: 32, 
                                  height: 32, 
                                  mr: 2,
                                  fontSize: '0.875rem'
                                }}>
                                  {p.targetName ? p.targetName.charAt(0) : '?'}
                                </Avatar>
                                {p.targetName || p.targetEmployeeId}
                              </Box>
                            </TableCell>
                            <TableCell sx={{ maxWidth: 300 }}>
                              <Tooltip title={p.reason} placement="top" arrow>
                                <Typography 
                                  sx={{ 
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {p.reason}
                                </Typography>
                              </Tooltip>
                            </TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <EventAvailableIcon color="action" fontSize="small" sx={{ mr: 1 }} />
                                <Typography variant="body2">
                                  {formatDate(p.beginDate)}
                                </Typography>
                              </Box>
                              <Box display="flex" alignItems="center">
                                <EventBusyIcon color="action" fontSize="small" sx={{ mr: 1 }} />
                                <Typography variant="body2">
                                  {formatDate(p.endDate)}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {formatDate(p.createdAt)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box display="flex" gap={1}>
                                <ActionButton
                                  variant="contained"
                                  size="small"
                                  startIcon={<CheckIcon />}
                                  onClick={() => handleStatusChange(p.id, 1)}
                                  sx={{
                                    bgcolor: 'success.light',
                                    color: 'success.contrastText',
                                    '&:hover': { bgcolor: 'success.main' }
                                  }}
                                >
                                  Approve
                                </ActionButton>
                                <ActionButton
                                  variant="contained"
                                  size="small"
                                  startIcon={<CloseIcon />}
                                  onClick={() => handleStatusChange(p.id, 2)}
                                  sx={{
                                    bgcolor: 'error.light',
                                    color: 'error.contrastText',
                                    '&:hover': { bgcolor: 'error.main' }
                                  }}
                                >
                                  Reject
                                </ActionButton>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))
                      )
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </GradientCard>

          {/* Request Permission Modal */}
          <Modal open={openRequestModal} onClose={() => setOpenRequestModal(false)}>
            <ModalBox>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
                Request New Permission
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <form onSubmit={handleRequestSubmit}>
                <TextField
                  fullWidth
                  label="Reason"
                  value={requestForm.reason}
                  onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                  margin="normal"
                  required
                  multiline
                  rows={4}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <DateTimePicker
                      label="Start Date & Time"
                      value={requestForm.beginDate}
                      onChange={(date) => setRequestForm({ ...requestForm, beginDate: date })}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          fullWidth 
                          margin="normal" 
                          required 
                          variant="outlined" 
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <DateTimePicker
                      label="End Date & Time"
                      value={requestForm.endDate}
                      onChange={(date) => setRequestForm({ ...requestForm, endDate: date })}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          fullWidth 
                          margin="normal" 
                          required 
                          variant="outlined" 
                        />
                      )}
                    />
                  </Grid>
                </Grid>
                <Box mt={4} display="flex" justifyContent="flex-end" gap={2}>
                  <ActionButton
                    onClick={() => setOpenRequestModal(false)}
                    variant="outlined"
                    sx={{
                      borderColor: 'grey.300',
                      color: 'text.primary',
                      '&:hover': { borderColor: 'grey.400' }
                    }}
                  >
                    Cancel
                  </ActionButton>
                  <ActionButton
                    type="submit"
                    variant="contained"
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' }
                    }}
                  >
                    Submit Request
                  </ActionButton>
                </Box>
              </form>
            </ModalBox>
          </Modal>

          {/* Create for Employee Modal */}
          <Modal open={openCreateModal} onClose={() => setOpenCreateModal(false)}>
            <ModalBox>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
                Create Permission for Employee
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <form onSubmit={handleCreateSubmit}>
                <TextField
                  fullWidth
                  label="Employee ID"
                  value={createForm.targetEmployeeId}
                  onChange={(e) => setCreateForm({ ...createForm, targetEmployeeId: e.target.value })}
                  margin="normal"
                  required
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Reason"
                  value={createForm.reason}
                  onChange={(e) => setCreateForm({ ...createForm, reason: e.target.value })}
                  margin="normal"
                  required
                  multiline
                  rows={4}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <DateTimePicker
                      label="Start Date & Time"
                      value={createForm.beginDate}
                      onChange={(date) => setCreateForm({ ...createForm, beginDate: date })}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          fullWidth 
                          margin="normal" 
                          required 
                          variant="outlined" 
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <DateTimePicker
                      label="End Date & Time"
                      value={createForm.endDate}
                      onChange={(date) => setCreateForm({ ...createForm, endDate: date })}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          fullWidth 
                          margin="normal" 
                          required 
                          variant="outlined" 
                        />
                      )}
                    />
                  </Grid>
                </Grid>
                <Box mt={4} display="flex" justifyContent="flex-end" gap={2}>
                  <ActionButton
                    onClick={() => setOpenCreateModal(false)}
                    variant="outlined"
                    sx={{
                      borderColor: 'grey.300',
                      color: 'text.primary',
                      '&:hover': { borderColor: 'grey.400' }
                    }}
                  >
                    Cancel
                  </ActionButton>
                  <ActionButton
                    type="submit"
                    variant="contained"
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' }
                    }}
                  >
                    Create Permission
                  </ActionButton>
                </Box>
              </form>
            </ModalBox>
          </Modal>

          {/* Notifications */}
          <Snackbar 
            open={!!error} 
            autoHideDuration={6000} 
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Alert 
              onClose={handleCloseSnackbar} 
              severity="error" 
              sx={{ 
                width: '100%',
                bgcolor: 'error.main',
                color: 'white',
                boxShadow: 3
              }}
            >
              {error}
            </Alert>
          </Snackbar>
          <Snackbar 
            open={!!success} 
            autoHideDuration={6000} 
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Alert 
              onClose={handleCloseSnackbar} 
              severity="success" 
              sx={{ 
                width: '100%',
                bgcolor: 'success.main',
                color: 'white',
                boxShadow: 3
              }}
            >
              {success}
            </Alert>
          </Snackbar>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}