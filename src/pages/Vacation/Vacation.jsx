import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Add as AddIcon, 
  Check as CheckIcon, 
  Close as CloseIcon,
  Person as PersonIcon,
  EventAvailable as EventAvailableIcon,
  EventBusy as EventBusyIcon,
  Dashboard as DashboardIcon,
  BeachAccess as VacationIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon
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
  Snackbar,
  Alert,
  CircularProgress,
  Typography,
  TextField,
  Avatar,
  IconButton,
  Badge,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  styled,
  alpha,
  useTheme,
  Tabs,
  Tab,
  Menu,
  MenuItem,
  Fade
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAuth } from '../../context/Authcontext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const API_BASE_URL = 'http://localhost:5042/api';

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

const StatusBadge = styled(Chip)(({ theme, status }) => ({
  borderRadius: '12px',
  fontWeight: 700,
  fontSize: '0.75rem',
  padding: '6px 12px',
  backgroundColor: 
    status === 1 ? alpha(chromaticColors.success, 0.15) :
    status === 2 ? alpha(chromaticColors.error, 0.15) :
    alpha(chromaticColors.warning, 0.15),
  color: 
    status === 1 ? chromaticColors.success :
    status === 2 ? chromaticColors.error :
    chromaticColors.warning,
  border: `2px solid ${
    status === 1 ? chromaticColors.success :
    status === 2 ? chromaticColors.error :
    chromaticColors.warning
  }`,
  boxShadow: `0 2px 8px ${
    status === 1 ? alpha(chromaticColors.success, 0.2) :
    status === 2 ? alpha(chromaticColors.error, 0.2) :
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

// Helper functions
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

const calculateDays = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const mapStatus = (code) => {
  switch (code) {
    case 0: return 'Pending';
    case 1: return 'Approved';
    case 2: return 'Rejected';
    default: return 'Unknown';
  }
};

const AnimatedTableCell = motion(TableCell);

export default function VacationPage() {
  const theme = useTheme();
  const { authenticated, user } = useAuth();
  const navigate = useNavigate();
  const [vacations, setVacations] = useState([]);
  const [vacationDaysLeft, setVacationDaysLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [openRequestModal, setOpenRequestModal] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'startDate', direction: 'desc' });

  const [requestForm, setRequestForm] = useState({
    startDate: new Date(),
    endDate: new Date(),
  });

  // Fetch vacation data when employeeId changes
  useEffect(() => {
    if (employeeId && authenticated) {
      fetchVacationData();
    }
  }, [employeeId, authenticated]);

  const fetchVacationData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Get vacation days left
      const leftRes = await axios.get(
        `${API_BASE_URL}/vacation/${employeeId}/left`,
        { headers }
      );
      setVacationDaysLeft(Math.round(leftRes.data));

      // Get vacation requests
      const requestsRes = await axios.get(
        `${API_BASE_URL}/vacation/${employeeId}/requests`,
        { headers }
      );

      const formattedVacations = Array.isArray(requestsRes.data) 
        ? requestsRes.data.map(v => ({
            ...v,
            statusText: mapStatus(v.status),
            days: calculateDays(v.startDate, v.endDate)
          }))
        : [];

      setVacations(formattedVacations);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch vacation data');
      setVacations([]);
      setVacationDaysLeft(0);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      await axios.post(
        `${API_BASE_URL}/vacation/${employeeId}/request`,
        {
          startDate: requestForm.startDate.toISOString(),
          endDate: requestForm.endDate.toISOString()
        },
        { headers }
      );

      setSuccess('Vacation request created successfully!');
      setOpenRequestModal(false);
      fetchVacationData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create vacation request');
    }
  };

  const handleApproveReject = async (vacationId, status) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      await axios.put(
        `${API_BASE_URL}/vacation/approve-or-reject`,
        {
          vacationRequestId: vacationId,
          status: status
        },
        { headers }
      );

      setSuccess(`Vacation request ${mapStatus(status).toLowerCase()} successfully!`);
      fetchVacationData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update vacation status');
    }
  };

  const handleDateChange = (field, date) => {
    setRequestForm(prev => ({
      ...prev,
      [field]: date
    }));
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

  const sortedVacations = React.useMemo(() => {
    let sortableItems = [...vacations];
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
  }, [vacations, sortConfig]);

  const filteredVacations = [
    sortedVacations,
    sortedVacations.filter(v => v.status === 0),
    sortedVacations.filter(v => v.status === 1),
    sortedVacations.filter(v => v.status === 2)
  ];

  if (!authenticated) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <GradientCard sx={{ p: 6, textAlign: 'center', maxWidth: '600px' }}>
          <Typography variant="h5" color="text.secondary" mb={3}>
            Please log in to view vacation information
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
  }

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
                <VacationIcon fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="h3" fontWeight="bold" color="text.primary" sx={{
                  background: `linear-gradient(45deg, ${chromaticColors.primary} 30%, ${chromaticColors.secondary} 90%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: `0 2px 10px ${alpha(chromaticColors.primary, 0.2)}`
                }}>
                  Vacation Management
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Manage employee vacation requests with style
                </Typography>
              </Box>
              <Box ml="auto" display="flex" alignItems="center">
                <IconButton
                  onClick={fetchVacationData}
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
                  <MenuItem onClick={() => { handleSort('startDate'); handleFilterClose(); }}>
                    Sort by Date {sortConfig.key === 'startDate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </MenuItem>
                  <MenuItem onClick={() => { handleSort('status'); handleFilterClose(); }}>
                    Sort by Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </MenuItem>
                  <MenuItem onClick={() => { handleSort('days'); handleFilterClose(); }}>
                    Sort by Duration {sortConfig.key === 'days' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </MenuItem>
                </Menu>
              </Box>
            </Box>
          </Box>

          {/* Employee Search and Stats */}
          <GradientCard sx={{ mb: 4, p: 3 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={6}>
                <Box display="flex" alignItems="center" gap={2}>
                  <TextField
                    fullWidth
                    label="Employee ID"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <PersonIcon sx={{ 
                          mr: 1, 
                          color: chromaticColors.primary 
                        }} />
                      ),
                      sx: {
                        borderRadius: '14px',
                        backgroundColor: alpha(theme.palette.background.paper, 0.8),
                        boxShadow: `0 2px 8px ${alpha(chromaticColors.primary, 0.1)}`
                      }
                    }}
                  />
                  <IconButton
                    onClick={fetchVacationData}
                    sx={{ 
                      bgcolor: chromaticColors.primary, 
                      color: 'white',
                      borderRadius: '14px',
                      width: '48px',
                      height: '48px',
                      boxShadow: `0 4px 12px ${alpha(chromaticColors.primary, 0.3)}`,
                      '&:hover': {
                        bgcolor: chromaticColors.secondary,
                        transform: 'scale(1.1)'
                      }
                    }}
                  >
                    <SearchIcon />
                  </IconButton>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box display="flex" justifyContent="flex-end" gap={3}>
                  <Paper elevation={0} sx={{ 
                    p: 3, 
                    minWidth: 200, 
                    borderRadius: '18px',
                    background: `linear-gradient(135deg, ${alpha(chromaticColors.primary, 0.2)} 0%, ${alpha(chromaticColors.secondary, 0.2)} 100%)`,
                    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                    backdropFilter: 'blur(8px)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      background: `linear-gradient(45deg, transparent 0%, ${alpha(theme.palette.common.white, 0.1)} 100%)`
                    }
                  }}>
                    <Typography variant="subtitle2" color="text.secondary" mb={1}>
                      Vacation Days Remaining
                    </Typography>
                    <Typography variant="h2" fontWeight="bold" sx={{
                      background: `linear-gradient(45deg, ${chromaticColors.primary} 0%, ${chromaticColors.secondary} 100%)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      {vacationDaysLeft}
                    </Typography>
                  </Paper>
                </Box>
              </Grid>
            </Grid>
          </GradientCard>

          {/* Actions */}
          <Box sx={{ mb: 4 }}>
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
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
              <Grid item xs={6} md={3}>
                <SoftButton
                  fullWidth
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenRequestModal(true)}
                  disabled={!employeeId}
                  sx={{ 
                    height: '56px',
                    background: `linear-gradient(45deg, ${chromaticColors.secondary} 0%, ${chromaticColors.purple} 100%)`,
                    color: 'white',
                    '&:disabled': {
                      background: `linear-gradient(45deg, ${alpha(chromaticColors.secondary, 0.5)} 0%, ${alpha(chromaticColors.purple, 0.5)} 100%)`
                    }
                  }}
                >
                  New Request
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
              {['All', 'Pending', 'Approved', 'Rejected'].map((label, index) => (
                <Tab
                  key={label}
                  label={
                    <Box display="flex" alignItems="center">
                      {label}
                      <Chip
                        label={filteredVacations[index].length}
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

          {/* Vacation Table */}
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
            ) : !employeeId ? (
              <Box p={6} textAlign="center" minHeight="300px">
                <Typography variant="h5" color="text.secondary" mb={3}>
                  Please enter an employee ID to view vacations
                </Typography>
                <PersonIcon sx={{ 
                  fontSize: '64px', 
                  color: alpha(theme.palette.text.secondary, 0.3),
                  mb: 2
                }} />
              </Box>
            ) : filteredVacations[activeTab].length === 0 ? (
              <Box p={6} textAlign="center" minHeight="300px">
                <Typography variant="h5" color="text.secondary" mb={3}>
                  No {['all', 'pending', 'approved', 'rejected'][activeTab]} vacations found
                </Typography>
                <VacationIcon sx={{ 
                  fontSize: '64px', 
                  color: alpha(theme.palette.text.secondary, 0.3),
                  mb: 2
                }} />
              </Box>
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{ 
                borderRadius: '18px',
                background: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`
              }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ 
                      background: `linear-gradient(90deg, ${alpha(chromaticColors.primary, 0.05)} 0%, ${alpha(chromaticColors.secondary, 0.05)} 100%)`
                    }}>
                      <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Request ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Period</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Days</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Status</TableCell>
                      {activeTab === 1 && <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Actions</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredVacations[activeTab].map((vacation) => (
                      <TableRow 
                        key={vacation.id}
                        component={motion.tr}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        sx={{ 
                          '&:hover': {
                            backgroundColor: alpha(chromaticColors.primary, 0.03)
                          }
                        }}
                      >
                        <AnimatedTableCell
                          whileHover={{ scale: 1.02 }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            {vacation.id.substring(0, 8)}...
                          </Typography>
                        </AnimatedTableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <EventAvailableIcon sx={{ 
                              mr: 1, 
                              color: chromaticColors.success,
                              fontSize: '20px'
                            }} />
                            <Typography>{formatDate(vacation.startDate)}</Typography>
                          </Box>
                          <Box display="flex" alignItems="center">
                            <EventBusyIcon sx={{ 
                              mr: 1, 
                              color: chromaticColors.error,
                              fontSize: '20px'
                            }} />
                            <Typography>{formatDate(vacation.endDate)}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <GlowBadge 
                            badgeContent={vacation.days}   
                            color={vacation.days > 10 ? 'error' : vacation.days > 5 ? 'warning' : 'success'}
                          />
                        </TableCell>
                        <TableCell>
                          <StatusBadge
                            label={vacation.statusText}
                            status={vacation.status}
                          />
                        </TableCell>
                        {activeTab === 1 && (
                          <TableCell>
                            <Box display="flex" gap={2}>
                              <SoftButton
                                variant="contained"
                                color="success"
                                size="small"
                                startIcon={<CheckIcon />}
                                onClick={() => handleApproveReject(vacation.id, 1)}
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
                                color="error"
                                size="small"
                                startIcon={<CloseIcon />}
                                onClick={() => handleApproveReject(vacation.id, 2)}
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
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </GradientCard>

          {/* Request Vacation Modal */}
          <Modal open={openRequestModal} onClose={() => setOpenRequestModal(false)}>
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '90%', sm: 600 },
              bgcolor: 'background.paper',
              boxShadow: `0 24px 48px ${alpha(chromaticColors.purple, 0.3)}`,
              p: 4,
              borderRadius: '24px',
              outline: 'none',
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.default, 0.9)} 100%)`,
              backdropFilter: 'blur(12px)'
            }}>
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
                  Request Vacation
                </Typography>
              </Box>
              <Divider sx={{ 
                mb: 3,
                background: `linear-gradient(90deg, transparent 0%, ${alpha(chromaticColors.primary, 0.3)} 50%, transparent 100%)`,
                height: '2px'
              }} />
              <form onSubmit={handleRequestSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <DateTimePicker
                      label="Start Date"
                      value={requestForm.startDate}
                      onChange={(date) => handleDateChange('startDate', date)}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          fullWidth 
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
                      minDate={new Date()}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <DateTimePicker
                      label="End Date"
                      value={requestForm.endDate}
                      onChange={(date) => handleDateChange('endDate', date)}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          fullWidth 
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
                      minDate={requestForm.startDate}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Accordion elevation={0} sx={{ 
                      borderRadius: '14px',
                      border: `1px solid ${alpha(chromaticColors.primary, 0.2)}`,
                      '&:before': {
                        display: 'none'
                      }
                    }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle1" fontWeight="bold">Request Summary</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box display="flex" justifyContent="space-between" mb={2}>
                          <Typography variant="body1" color="text.secondary">Start Date:</Typography>
                          <Typography variant="body1" fontWeight="bold">
                            {formatDate(requestForm.startDate)}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between" mb={2}>
                          <Typography variant="body1" color="text.secondary">End Date:</Typography>
                          <Typography variant="body1" fontWeight="bold">
                            {formatDate(requestForm.endDate)}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body1" color="text.secondary">Total Days:</Typography>
                          <Typography variant="body1" fontWeight="bold" sx={{
                            color: calculateDays(requestForm.startDate, requestForm.endDate) > 10 ? 
                              chromaticColors.error : calculateDays(requestForm.startDate, requestForm.endDate) > 5 ? 
                              chromaticColors.warning : chromaticColors.success
                          }}>
                            {calculateDays(requestForm.startDate, requestForm.endDate)} days
                          </Typography>
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  </Grid>
                </Grid>
                <Box mt={4} display="flex" justifyContent="flex-end" gap={2}>
                  <SoftButton
                    variant="outlined"
                    onClick={() => setOpenRequestModal(false)}
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
            </Box>
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