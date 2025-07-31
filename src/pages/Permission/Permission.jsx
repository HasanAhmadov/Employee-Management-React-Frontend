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
  Dashboard as DashboardIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon
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
  Tooltip,
  Tabs,
  Tab,
  Menu,
  MenuItem,
  Fade,
  useTheme,
  alpha,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAuth } from '../../context/Authcontext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';

const API_BASE_URL = 'http://localhost:5042/api';
const permissionApi = axios.create({ baseURL: `${API_BASE_URL}/Permission` });
const employeeApi = axios.create({ baseURL: `${API_BASE_URL}/Employee` });

// Chromatic color palette
const chromaticColors = {
  primary: '#6C5CE7',
  secondary: '#FD79A8',
  success: '#00B894',
  error: '#D63031',
  warning: '#FDCB6E',
  info: '#0984E3',
  purple: '#A569BD',
  orange: '#E67E22',
  teal: '#1ABC9C'
};

// Enhanced styled components with chromatic colors
const GradientCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(chromaticColors.primary, 0.1)} 0%, ${alpha(chromaticColors.secondary, 0.1)} 100%)`,
  backdropFilter: 'blur(12px)',
  borderRadius: '24px',
  boxShadow: `0 12px 40px ${alpha(chromaticColors.purple, 0.2)}`,
  border: '1px solid rgba(255, 255, 255, 0.3)',
  overflow: 'hidden',
  position: 'relative',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    background: `radial-gradient(circle, ${alpha(chromaticColors.info, 0.1)} 0%, transparent 70%)`,
    animation: 'rotate 15s linear infinite',
    '@keyframes rotate': {
      '0%': { transform: 'rotate(0deg)' },
      '100%': { transform: 'rotate(360deg)' }
    }
  }
}));

const StatusBadge = styled(Chip)(({ theme, status }) => ({
  borderRadius: '12px',
  fontWeight: 700,
  fontSize: '0.75rem',
  padding: '6px 12px',
  backgroundColor: 
    status === 'Approved' ? alpha(chromaticColors.success, 0.15) :
    status === 'Rejected' ? alpha(chromaticColors.error, 0.15) :
    alpha(chromaticColors.warning, 0.15),
  color: 
    status === 'Approved' ? chromaticColors.success :
    status === 'Rejected' ? chromaticColors.error :
    chromaticColors.warning,
  border: `2px solid ${
    status === 'Approved' ? chromaticColors.success :
    status === 'Rejected' ? chromaticColors.error :
    chromaticColors.warning
  }`,
  boxShadow: `0 2px 8px ${
    status === 'Approved' ? alpha(chromaticColors.success, 0.2) :
    status === 'Rejected' ? alpha(chromaticColors.error, 0.2) :
    alpha(chromaticColors.warning, 0.2)
  }`
}));

const GlowBadge = styled(Badge)(({ theme, color }) => ({
  '& .MuiBadge-badge': {
    borderRadius: '12px',
    padding: '8px 12px',
    fontWeight: 'bold',
    fontSize: '0.9rem',
    minWidth: '36px',
    height: '32px',
    backgroundColor: chromaticColors[color] || chromaticColors.primary,
    color: 'white',
    boxShadow: `0 0 12px ${alpha(chromaticColors[color] || chromaticColors.primary, 0.7)}`,
    border: `1px solid white`
  }
}));

const SoftButton = styled(Button)(({ theme }) => ({
  borderRadius: '14px',
  padding: '12px 24px',
  textTransform: 'none',
  fontWeight: 600,
  letterSpacing: '0.5px',
  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: `0 6px 16px ${alpha(chromaticColors.primary, 0.3)}`
  },
  '&:active': {
    transform: 'translateY(1px)'
  }
}));

const ModalBox = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '500px',
  backgroundColor: theme.palette.background.paper,
  borderRadius: '24px',
  boxShadow: `0 24px 48px ${alpha(chromaticColors.purple, 0.3)}`,
  padding: theme.spacing(4),
  outline: 'none',
  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.default, 0.9)} 100%)`,
  backdropFilter: 'blur(12px)'
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
  const theme = useTheme();
  const { authenticated, user } = useAuth();
  const navigate = useNavigate();
  const [permissions, setPermissions] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [openRequestModal, setOpenRequestModal] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

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

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedPermissions = React.useMemo(() => {
    let sortableItems = [...permissions];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [permissions, sortConfig]);

  const allPermissions = sortedPermissions;
  const pending = sortedPermissions.filter(p => p.statusText === 'Pending');

  const filteredPermissions = [
    allPermissions,
    pending
  ];

  if (!authenticated && !loading) return (
    <Box 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      minHeight="80vh"
      textAlign="center"
    >
      <GradientCard sx={{ p: 6, textAlign: 'center', maxWidth: '600px' }}>
        <Typography variant="h5" color="text.secondary" mb={3}>
          Please log in to view permissions
        </Typography>
        <SoftButton
          variant="contained"
          color="primary"
          onClick={() => navigate('/login')}
          sx={{
            background: `linear-gradient(45deg, ${chromaticColors.primary} 0%, ${chromaticColors.secondary} 100%)`,
            color: 'white'
          }}
        >
          Go to Login
        </SoftButton>
      </GradientCard>
    </Box>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ 
        p: { xs: 2, md: 4 }, 
        minHeight: '100vh',
        background: theme.palette.mode === 'light' 
          ? `linear-gradient(135deg, #f9f9ff 0%, #f0f2ff 100%)` 
          : `linear-gradient(135deg, #0f0f23 0%, #1a1a3a 100%)`,
        position: 'relative',
        overflow: 'hidden',
        '&:before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `radial-gradient(circle at 20% 30%, ${alpha(chromaticColors.purple, 0.1)} 0%, transparent 50%)`,
          zIndex: 0
        },
        '&:after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '100%',
          height: '100%',
          background: `radial-gradient(circle at 80% 70%, ${alpha(chromaticColors.teal, 0.1)} 0%, transparent 50%)`,
          zIndex: 0
        }
      }}>
        {/* Floating decorative elements */}
        <Box sx={{
          position: 'absolute',
          top: '10%',
          right: '5%',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(chromaticColors.secondary, 0.2)} 0%, transparent 70%)`,
          filter: 'blur(20px)',
          zIndex: 0
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: '10%',
          left: '5%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(chromaticColors.primary, 0.2)} 0%, transparent 70%)`,
          filter: 'blur(30px)',
          zIndex: 0
        }} />

        {/* Main content with higher z-index */}
        <Box position="relative" zIndex={1}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Box display="flex" alignItems="center" mb={2} flexWrap="wrap">
              <Avatar sx={{ 
                bgcolor: chromaticColors.primary, 
                mr: 2, 
                width: 64, 
                height: 64,
                boxShadow: `0 8px 24px ${alpha(chromaticColors.primary, 0.4)}`
              }}>
                <EventAvailableIcon fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="h3" fontWeight="bold" color="text.primary" sx={{
                  background: `linear-gradient(45deg, ${chromaticColors.primary} 30%, ${chromaticColors.secondary} 90%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: `0 2px 10px ${alpha(chromaticColors.primary, 0.2)}`
                }}>
                  Permission Management
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Manage and track employee permissions with style
                </Typography>
              </Box>
              <Box ml="auto" display="flex" alignItems="center">
                <IconButton
                  onClick={refresh}
                  sx={{
                    bgcolor: alpha(chromaticColors.info, 0.2),
                    color: chromaticColors.info,
                    mr: 1,
                    '&:hover': {
                      bgcolor: alpha(chromaticColors.info, 0.3),
                      transform: 'rotate(360deg)',
                      transition: 'transform 0.7s ease'
                    }
                  }}
                >
                  <RefreshIcon />
                </IconButton>
                <SoftButton
                  variant="contained"
                  startIcon={<FilterIcon />}
                  onClick={handleFilterClick}
                  sx={{
                    bgcolor: alpha(chromaticColors.purple, 0.2),
                    color: chromaticColors.purple,
                    '&:hover': {
                      bgcolor: alpha(chromaticColors.purple, 0.3)
                    }
                  }}
                >
                  Filter & Sort
                </SoftButton>
                <Menu
                  anchorEl={filterAnchorEl}
                  open={Boolean(filterAnchorEl)}
                  onClose={handleFilterClose}
                  TransitionComponent={Fade}
                  PaperProps={{
                    sx: {
                      borderRadius: '16px',
                      bgcolor: 'background.paper',
                      boxShadow: `0 8px 32px ${alpha(chromaticColors.purple, 0.2)}`,
                      minWidth: '200px',
                      p: 1
                    }
                  }}
                >
                  <MenuItem onClick={() => { handleSort('createdAt'); handleFilterClose(); }}>
                    Sort by Date {sortConfig.key === 'createdAt' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </MenuItem>
                  <MenuItem onClick={() => { handleSort('status'); handleFilterClose(); }}>
                    Sort by Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </MenuItem>
                  <MenuItem onClick={() => { handleSort('requesterName'); handleFilterClose(); }}>
                    Sort by Requester {sortConfig.key === 'requesterName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </MenuItem>
                </Menu>
              </Box>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ mb: 4 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <SoftButton
                  fullWidth
                  variant="contained"
                  startIcon={<DashboardIcon />}
                  onClick={() => navigate('/dashboard')}
                  sx={{
                    height: '56px',
                    background: `linear-gradient(45deg, ${chromaticColors.info} 0%, ${chromaticColors.teal} 100%)`,
                    color: 'white'
                  }}
                >
                  Back to Dashboard
                </SoftButton>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <SoftButton
                  fullWidth
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenRequestModal(true)}
                  sx={{
                    height: '56px',
                    background: `linear-gradient(45deg, ${chromaticColors.secondary} 0%, ${chromaticColors.purple} 100%)`,
                    color: 'white'
                  }}
                >
                  Request Permission
                </SoftButton>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <SoftButton
                  fullWidth
                  variant="contained"
                  startIcon={<PersonSearchIcon />}
                  onClick={() => setOpenCreateModal(true)}
                  sx={{
                    height: '56px',
                    background: `linear-gradient(45deg, ${chromaticColors.orange} 0%, ${chromaticColors.warning} 100%)`,
                    color: 'white'
                  }}
                >
                  Create for Employee
                </SoftButton>
              </Grid>
            </Grid>
          </Box>

          {/* Tabs */}
          <Box sx={{ mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTabs-indicator': {
                  height: '4px',
                  borderRadius: '4px',
                  background: `linear-gradient(45deg, ${chromaticColors.primary} 0%, ${chromaticColors.secondary} 100%)`
                }
              }}
            >
              {['All Permissions', 'Pending Approvals'].map((label, index) => (
                <Tab
                  key={label}
                  label={
                    <Box display="flex" alignItems="center">
                      {label}
                      <Chip
                        label={filteredPermissions[index].length}
                        size="small"
                        sx={{ 
                          ml: 1,
                          bgcolor: activeTab === index ? 'white' : alpha(chromaticColors.primary, 0.1),
                          color: activeTab === index ? chromaticColors.primary : 'text.primary',
                          fontWeight: 600
                        }}
                      />
                    </Box>
                  }
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    color: activeTab === index ? chromaticColors.primary : 'text.secondary',
                    minHeight: '48px',
                    '&:hover': {
                      color: chromaticColors.primary
                    }
                  }}
                />
              ))}
            </Tabs>
          </Box>

          {/* Content */}
          <GradientCard>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" p={6} minHeight="300px">
                <CircularProgress 
                  size={80} 
                  thickness={5} 
                  sx={{ 
                    color: chromaticColors.primary,
                    '& circle': {
                      strokeLinecap: 'round'
                    }
                  }} 
                />
              </Box>
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{ 
                borderRadius: '18px',
                background: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`
              }}>
                <Table>
                  <TableHead sx={{ 
                    background: `linear-gradient(90deg, ${alpha(chromaticColors.primary, 0.05)} 0%, ${alpha(chromaticColors.secondary, 0.05)} 100%)`
                  }}>
                    <TableRow>
                      {activeTab === 0 ? (
                        <>
                          <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Requester</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Target</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Reason</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Period</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Created</TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Requester</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Target</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Reason</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Period</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Created</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Actions</TableCell>
                        </>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredPermissions[activeTab].length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={activeTab === 0 ? 6 : 7} align="center" sx={{ py: 6 }}>
                          <Typography variant="h6" color="text.secondary">
                            {activeTab === 0 ? 'No permission records found' : 'No pending permissions to approve'}
                          </Typography>
                          <DescriptionIcon sx={{ 
                            fontSize: '64px', 
                            color: alpha(theme.palette.text.secondary, 0.3),
                            mt: 2
                          }} />
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPermissions[activeTab].map((p) => (
                        <TableRow 
                          key={p.id}
                          component={motion.tr}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          hover
                          sx={{ 
                            '&:last-child td': { borderBottom: 0 },
                            '&:hover': {
                              backgroundColor: alpha(chromaticColors.primary, 0.03)
                            }
                          }}
                        >
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <Avatar sx={{ 
                                bgcolor: alpha(chromaticColors.primary, 0.2), 
                                color: chromaticColors.primary,
                                width: 36, 
                                height: 36, 
                                mr: 2,
                                fontSize: '0.875rem',
                                fontWeight: 600
                              }}>
                                {p.requesterName ? p.requesterName.charAt(0) : '?'}
                              </Avatar>
                              <Typography>
                                {p.requesterName || p.requesterId}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <Avatar sx={{ 
                                bgcolor: alpha(chromaticColors.secondary, 0.2), 
                                color: chromaticColors.secondary,
                                width: 36, 
                                height: 36, 
                                mr: 2,
                                fontSize: '0.875rem',
                                fontWeight: 600
                              }}>
                                {p.targetName ? p.targetName.charAt(0) : '?'}
                              </Avatar>
                              <Typography>
                                {p.targetName || p.targetEmployeeId}
                              </Typography>
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
                              <EventAvailableIcon sx={{ 
                                mr: 1, 
                                color: chromaticColors.success,
                                fontSize: '20px'
                              }} />
                              <Typography variant="body2">
                                {formatDate(p.beginDate)}
                              </Typography>
                            </Box>
                            <Box display="flex" alignItems="center">
                              <EventBusyIcon sx={{ 
                                mr: 1, 
                                color: chromaticColors.error,
                                fontSize: '20px'
                              }} />
                              <Typography variant="body2">
                                {formatDate(p.endDate)}
                              </Typography>
                            </Box>
                          </TableCell>
                          {activeTab === 0 && (
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
                          )}
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(p.createdAt)}
                            </Typography>
                          </TableCell>
                          {activeTab === 1 && (
                            <TableCell>
                              <Box display="flex" gap={2}>
                                <SoftButton
                                  variant="contained"
                                  size="small"
                                  startIcon={<CheckIcon />}
                                  onClick={() => handleStatusChange(p.id, 1)}
                                  sx={{
                                    minWidth: '120px',
                                    background: `linear-gradient(45deg, ${chromaticColors.success} 0%, ${chromaticColors.teal} 100%)`,
                                    color: 'white'
                                  }}
                                >
                                  Approve
                                </SoftButton>
                                <SoftButton
                                  variant="contained"
                                  size="small"
                                  startIcon={<CloseIcon />}
                                  onClick={() => handleStatusChange(p.id, 2)}
                                  sx={{
                                    minWidth: '120px',
                                    background: `linear-gradient(45deg, ${chromaticColors.error} 0%, ${chromaticColors.orange} 100%)`,
                                    color: 'white'
                                  }}
                                >
                                  Reject
                                </SoftButton>
                              </Box>
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </GradientCard>

          {/* Request Permission Modal */}
          <Modal open={openRequestModal} onClose={() => setOpenRequestModal(false)}>
            <ModalBox>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ 
                  bgcolor: chromaticColors.primary, 
                  mr: 2,
                  color: 'white',
                  width: 48,
                  height: 48,
                  boxShadow: `0 4px 12px ${alpha(chromaticColors.primary, 0.3)}`
                }}>
                  <AddIcon />
                </Avatar>
                <Typography variant="h5" fontWeight="bold" sx={{
                  background: `linear-gradient(45deg, ${chromaticColors.primary} 0%, ${chromaticColors.secondary} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Request New Permission
                </Typography>
              </Box>
              <Divider sx={{ 
                mb: 3,
                background: `linear-gradient(90deg, transparent 0%, ${alpha(chromaticColors.primary, 0.3)} 50%, transparent 100%)`,
                height: '2px'
              }} />
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
                  sx={{ mb: 3 }}
                  InputProps={{
                    sx: {
                      borderRadius: '14px',
                      '& fieldset': {
                        borderColor: alpha(chromaticColors.primary, 0.3)
                      },
                      '&:hover fieldset': {
                        borderColor: chromaticColors.primary
                      }
                    }
                  }}
                />
                <Grid container spacing={3}>
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
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '14px',
                              '& fieldset': {
                                borderColor: alpha(chromaticColors.primary, 0.3)
                              },
                              '&:hover fieldset': {
                                borderColor: chromaticColors.primary
                              }
                            }
                          }}
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
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '14px',
                              '& fieldset': {
                                borderColor: alpha(chromaticColors.primary, 0.3)
                              },
                              '&:hover fieldset': {
                                borderColor: chromaticColors.primary
                              }
                            }
                          }}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
                <Box mt={4} display="flex" justifyContent="flex-end" gap={2}>
                  <SoftButton
                    onClick={() => setOpenRequestModal(false)}
                    variant="outlined"
                    sx={{
                      color: 'text.secondary',
                      borderColor: 'divider',
                      '&:hover': {
                        borderColor: chromaticColors.error,
                        color: chromaticColors.error
                      }
                    }}
                  >
                    Cancel
                  </SoftButton>
                  <SoftButton
                    type="submit"
                    variant="contained"
                    sx={{
                      background: `linear-gradient(45deg, ${chromaticColors.primary} 0%, ${chromaticColors.secondary} 100%)`,
                      color: 'white',
                      '&:hover': {
                        boxShadow: `0 6px 20px ${alpha(chromaticColors.primary, 0.4)}`
                      }
                    }}
                  >
                    Submit Request
                  </SoftButton>
                </Box>
              </form>
            </ModalBox>
          </Modal>

          {/* Create for Employee Modal */}
          <Modal open={openCreateModal} onClose={() => setOpenCreateModal(false)}>
            <ModalBox>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ 
                  bgcolor: chromaticColors.orange, 
                  mr: 2,
                  color: 'white',
                  width: 48,
                  height: 48,
                  boxShadow: `0 4px 12px ${alpha(chromaticColors.orange, 0.3)}`
                }}>
                  <PersonSearchIcon />
                </Avatar>
                <Typography variant="h5" fontWeight="bold" sx={{
                  background: `linear-gradient(45deg, ${chromaticColors.orange} 0%, ${chromaticColors.warning} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Create Permission for Employee
                </Typography>
              </Box>
              <Divider sx={{ 
                mb: 3,
                background: `linear-gradient(90deg, transparent 0%, ${alpha(chromaticColors.orange, 0.3)} 50%, transparent 100%)`,
                height: '2px'
              }} />
              <form onSubmit={handleCreateSubmit}>
                <TextField
                  fullWidth
                  label="Employee ID"
                  value={createForm.targetEmployeeId}
                  onChange={(e) => setCreateForm({ ...createForm, targetEmployeeId: e.target.value })}
                  margin="normal"
                  required
                  variant="outlined"
                  sx={{ mb: 3 }}
                  InputProps={{
                    sx: {
                      borderRadius: '14px',
                      '& fieldset': {
                        borderColor: alpha(chromaticColors.primary, 0.3)
                      },
                      '&:hover fieldset': {
                        borderColor: chromaticColors.primary
                      }
                    }
                  }}
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
                  sx={{ mb: 3 }}
                  InputProps={{
                    sx: {
                      borderRadius: '14px',
                      '& fieldset': {
                        borderColor: alpha(chromaticColors.primary, 0.3)
                      },
                      '&:hover fieldset': {
                        borderColor: chromaticColors.primary
                      }
                    }
                  }}
                />
                <Grid container spacing={3}>
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
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '14px',
                              '& fieldset': {
                                borderColor: alpha(chromaticColors.primary, 0.3)
                              },
                              '&:hover fieldset': {
                                borderColor: chromaticColors.primary
                              }
                            }
                          }}
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
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '14px',
                              '& fieldset': {
                                borderColor: alpha(chromaticColors.primary, 0.3)
                              },
                              '&:hover fieldset': {
                                borderColor: chromaticColors.primary
                              }
                            }
                          }}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
                <Box mt={4} display="flex" justifyContent="flex-end" gap={2}>
                  <SoftButton
                    onClick={() => setOpenCreateModal(false)}
                    variant="outlined"
                    sx={{
                      color: 'text.secondary',
                      borderColor: 'divider',
                      '&:hover': {
                        borderColor: chromaticColors.error,
                        color: chromaticColors.error
                      }
                    }}
                  >
                    Cancel
                  </SoftButton>
                  <SoftButton
                    type="submit"
                    variant="contained"
                    sx={{
                      background: `linear-gradient(45deg, ${chromaticColors.primary} 0%, ${chromaticColors.secondary} 100%)`,
                      color: 'white',
                      '&:hover': {
                        boxShadow: `0 6px 20px ${alpha(chromaticColors.primary, 0.4)}`
                      }
                    }}
                  >
                    Create Permission
                  </SoftButton>
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
            TransitionComponent={Fade}
          >
            <Alert 
              severity="error" 
              onClose={handleCloseSnackbar}
              sx={{
                borderRadius: '14px',
                boxShadow: `0 8px 24px ${alpha(chromaticColors.error, 0.2)}`,
                background: `linear-gradient(135deg, ${alpha(theme.palette.error.light, 0.9)} 0%, ${alpha(theme.palette.error.dark, 0.9)} 100%)`,
                color: 'white',
                '& .MuiAlert-icon': {
                  color: 'white'
                }
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
            TransitionComponent={Fade}
          >
            <Alert 
              severity="success" 
              onClose={handleCloseSnackbar}
              sx={{
                borderRadius: '14px',
                boxShadow: `0 8px 24px ${alpha(chromaticColors.success, 0.2)}`,
                background: `linear-gradient(135deg, ${alpha(theme.palette.success.light, 0.9)} 0%, ${alpha(theme.palette.success.dark, 0.9)} 100%)`,
                color: 'white',
                '& .MuiAlert-icon': {
                  color: 'white'
                }
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