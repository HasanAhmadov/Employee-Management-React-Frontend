import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Clock, FileText, Users, Calendar, CheckCircle, AlertCircle, Activity, LogIn, LogOut } from 'lucide-react';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5042/api/EmployeeLog',
});

// Helper function to format date/time
const formatDateTime = (dateTimeString, showTime = true) => {
  if (!dateTimeString) return 'N/A';
  
  try {
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) {
      const match = dateTimeString.match(/^(\d{4}-\d{2}-\d{2})/);
      return match ? match[1] : dateTimeString;
    }
    
    const pad = (num) => num.toString().padStart(2, '0');
    const dateStr = `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
    const timeStr = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    
    return showTime ? `${dateStr} ${timeStr}` : dateStr;
  } catch (e) {
    console.error('Error formatting date:', e);
    return dateTimeString;
  }
};

export default function EmployeeLogDashboard() {
  const [token, setToken] = useState('');
  const [logAction, setLogAction] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [response, setResponse] = useState(null);
  const [responseType, setResponseType] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handleApiCall = async (apiCall, type) => {
    setLoading(true);
    setResponseType(type);
    try {
      const res = await apiCall();
      setResponse(res.data);
    } catch (error) {
      setResponse({ error: `Error: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const logEntry = async () => {
    setLoading(true);
    setResponseType('logEntry');
    try {
      const res = await api.post('/LogEntry', { action: logAction }, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      // Custom success messages based on action
      let successMessage = 'Log entry successful';
      let isEnter = false;
      let isExit = false;
      
      if (logAction.toLowerCase().includes('enter') || logAction.toLowerCase().includes('in')) {
        successMessage = 'Successfully logged entry (Employee entered)';
        isEnter = true;
      } else if (logAction.toLowerCase().includes('exit') || logAction.toLowerCase().includes('out')) {
        successMessage = 'Successfully logged exit (Employee exited)';
        isExit = true;
      }
      
      setResponse({ 
        message: successMessage,
        isEnter,
        isExit
      });
    } catch (error) {
      setResponse({ error: `Error: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const getLogsByEmployeeId = () => handleApiCall(
    () => api.get(`/GetLogsByEmployeeId/${employeeId}`, { headers: { Authorization: `Bearer ${token}` } }),
    'employeeLogs'
  );

  const getAttendanceByEmployeeId = () => handleApiCall(
    () => api.get(`/GetAttendanceByEmployeeId/${employeeId}`, { headers: { Authorization: `Bearer ${token}` } }),
    'employeeAttendance'
  );

  const getAllLogs = () => handleApiCall(
    () => api.get('/GetAllLogs', { headers: { Authorization: `Bearer ${token}` } }),
    'allLogs'
  );

  const getAllAttendances = () => handleApiCall(
    () => api.get('/GetAllEmployeesAttendances', { headers: { Authorization: `Bearer ${token}` } }),
    'allAttendances'
  );

  const renderTable = () => {
    if (!response || response.error) {
      return (
        <div className="flex items-center justify-center p-8 text-red-600">
          <AlertCircle className="mr-2" size={20} />
          {response?.error || 'No data available'}
        </div>
      );
    }

    if (responseType === 'allAttendances' && Array.isArray(response)) {
      const flattenedResponse = response.flat();
      return renderAttendanceTable(flattenedResponse, true);
    }

    let dataArray = Array.isArray(response) ? response : [response];
    dataArray = dataArray.filter(item => item && typeof item === 'object');
    
    if (dataArray.length === 0) {
      return (
        <div className="flex items-center justify-center p-8 text-gray-600">
          <AlertCircle className="mr-2" size={20} />
          No data found
        </div>
      );
    }

    if (responseType === 'logEntry') {
      const isEnter = response.isEnter;
      const isExit = response.isExit;
      
      return (
        <div className={`bg-gradient-to-r ${isEnter ? 'from-green-50 to-emerald-50' : isExit ? 'from-blue-50 to-indigo-50' : 'from-green-50 to-emerald-50'} p-6 rounded-2xl border ${isEnter ? 'border-green-200' : isExit ? 'border-blue-200' : 'border-green-200'}`}>
          <div className={`flex items-center ${isEnter ? 'text-green-700' : isExit ? 'text-blue-700' : 'text-green-700'} mb-2`}>
            {isEnter ? <LogIn className="mr-2" size={20} /> : isExit ? <LogOut className="mr-2" size={20} /> : <CheckCircle className="mr-2" size={20} />}
            <span className="font-semibold">Success!</span>
          </div>
          <p className={isEnter ? 'text-green-600' : isExit ? 'text-blue-600' : 'text-green-600'}>
            {response.message}
          </p>
        </div>
      );
    }

    if (responseType === 'employeeLogs' || responseType === 'allLogs') {
      const isAllLogs = responseType === 'allLogs';
      const borderColor = isAllLogs ? 'border-yellow-200' : 'border-blue-200';
      const gradientFrom = isAllLogs ? 'from-yellow-500' : 'from-blue-600';
      const gradientTo = isAllLogs ? 'to-orange-500' : 'to-indigo-600';
      const bgColor = isAllLogs ? 'bg-yellow-50' : 'bg-blue-50';
      const textColor = isAllLogs ? 'text-yellow-900' : 'text-blue-900';
      const divideColor = isAllLogs ? 'divide-yellow-100' : 'divide-blue-100';
      const title = isAllLogs ? 'All Employee Logs' : 'Employee Logs';

      return (
        <div className={`overflow-hidden rounded-2xl border ${borderColor} shadow-lg`}>
          <div className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} px-6 py-4`}>
            <h3 className="text-white text-lg font-semibold flex items-center">
              <FileText className="mr-2" size={20} />
              {title}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={bgColor}>
                <tr>
                  {Object.keys(dataArray[0]).map((key) => (
                    <th key={key} className="px-6 py-4 text-left text-sm font-semibold capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${divideColor}`}>
                {dataArray.map((log, index) => (
                  <tr key={index} className="hover:bg-opacity-50 transition-colors">
                    {Object.entries(log).map(([key, value]) => (
                      <td key={key} className="px-6 py-4 text-sm">
                        {key.toLowerCase().includes('name') ? (
                          <div className="flex items-center">
                            <User className="mr-2 text-gray-400" size={16} />
                            <span className="font-medium text-gray-900">{String(value)}</span>
                          </div>
                        ) : key.toLowerCase().includes('action') ? (
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            String(value).toLowerCase().includes('enter') ? 'bg-green-100 text-green-800' :
                            String(value).toLowerCase().includes('exit') ? 'bg-red-100 text-red-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            <Activity className="mr-1" size={14} />
                            {String(value)}
                          </span>
                        ) : key.toLowerCase().includes('timestamp') || key.toLowerCase().includes('date') ? (
                          <span className="text-gray-600">{formatDateTime(value, false)}</span>
                        ) : key.toLowerCase().includes('id') && typeof value === 'string' && value.length > 20 ? (
                          <span className="font-mono text-gray-500 text-xs">{String(value)}</span>
                        ) : typeof value === 'object' && value !== null ? (
                          <span className="text-gray-500 italic">Complex data</span>
                        ) : (
                          <span className="text-gray-900">{String(value)}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (responseType === 'employeeAttendance') {
      return renderAttendanceTable(dataArray, false);
    }
  };

  const renderAttendanceTable = (dataArray, isAllAttendances) => {
    const borderColor = isAllAttendances ? 'border-indigo-200' : 'border-purple-200';
    const gradientFrom = isAllAttendances ? 'from-indigo-600' : 'from-purple-600';
    const gradientTo = isAllAttendances ? 'to-blue-600' : 'to-pink-600';
    const bgColor = isAllAttendances ? 'bg-indigo-50' : 'bg-purple-50';
    const textColor = isAllAttendances ? 'text-indigo-900' : 'text-purple-900';
    const divideColor = isAllAttendances ? 'divide-indigo-100' : 'divide-purple-100';
    const icon = isAllAttendances ? <Calendar className="mr-2" size={20} /> : <Clock className="mr-2" size={20} />;
    const title = isAllAttendances ? 'All Employee Attendances' : 'Employee Attendance';

    const allKeys = dataArray.length > 0 ? 
      Object.keys(dataArray[0]).filter(key => !['employee', 'employeeShift'].includes(key)) : 
      [];

    return (
      <div className={`overflow-hidden rounded-2xl border ${borderColor} shadow-lg`}>
        <div className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} px-6 py-4`}>
          <h3 className="text-white text-lg font-semibold flex items-center">
            {icon}
            {title}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={bgColor}>
              <tr>
                <th className={`px-6 py-4 text-left text-sm font-semibold ${textColor}`}>Employee</th>
                
                {allKeys.map((key) => (
                  <th key={key} className={`px-6 py-4 text-left text-sm font-semibold ${textColor} capitalize`}>
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </th>
                ))}
                
                <th className={`px-6 py-4 text-left text-sm font-semibold ${textColor}`}>Shift</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${divideColor}`}>
              {dataArray.map((attendance, index) => (
                <tr key={index} className="hover:bg-opacity-50 transition-colors">
                  <td className="px-6 py-4 text-sm">
                    {attendance.employee ? (
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <User className="mr-2 text-gray-400" size={16} />
                          <span className="font-medium text-gray-900">{attendance.employee.name}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {attendance.employee.email}
                        </div>
                        <div className="text-xs text-gray-500">
                          {attendance.employee.phone}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-500 italic">N/A</span>
                    )}
                  </td>
                  
                  {allKeys.map((key) => {
                    const value = attendance[key];
                    if (key.toLowerCase().includes('clockin') || 
                        key.toLowerCase().includes('clockout') || 
                        key.toLowerCase().includes('earliest') || 
                        key.toLowerCase().includes('latest')) {
                      return (
                        <td key={key} className="px-6 py-4 text-sm">
                          <span className={
                            key.toLowerCase().includes('clockin') || key.toLowerCase().includes('earliest') 
                              ? "text-green-600 font-semibold" 
                              : "text-red-600 font-semibold"
                          }>
                            {formatDateTime(value)}
                          </span>
                        </td>
                      );
                    }
                    
                    return (
                      <td key={key} className="px-6 py-4 text-sm">
                        {key.toLowerCase().includes('minutes') ? (
                          <span className="text-gray-900">{String(value)} min</span>
                        ) : key.toLowerCase().includes('status') ? (
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            value === 'Present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {String(value)}
                          </span>
                        ) : key.toLowerCase().includes('date') ? (
                          <span className="font-medium text-gray-900">{formatDateTime(value, false)}</span>
                        ) : typeof value === 'object' && value !== null ? (
                          <span className="text-gray-500 italic">Complex data</span>
                        ) : (
                          <span className="text-gray-900">{String(value)}</span>
                        )}
                      </td>
                    );
                  })}
                  
                  <td className="px-6 py-4 text-sm">
                    {attendance.employeeShift ? (
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          Shift {attendance.employeeShift.id}
                        </span>
                        <span className="text-xs text-gray-500">
                          {attendance.employeeShift.workStart} - {attendance.employeeShift.workEnd}
                        </span>
                      </div>
                    ) : attendance.employee?.shiftId ? (
                      <span className="font-medium text-gray-900">
                        Shift {attendance.employee.shiftId}
                      </span>
                    ) : (
                      <span className="text-gray-500 italic">N/A</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 py-12 px-4">
        <button 
          onClick={() => navigate('/dashboard')}
          className="mb-8 bg-white/80 hover:bg-white text-gray-800 font-semibold py-3 px-6 rounded-full shadow-lg transition-all duration-300 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Dashboard
        </button>

        <div className="max-w-7xl mx-auto space-y-12 px-4">
          <div className="text-center space-y-4 pt-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-2xl mb-6 transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <FileText className="text-white" size={32} />
            </div>
            <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
              Employee Log Dashboard
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Streamline your workforce management with our advanced logging system
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-emerald-600 rounded-3xl blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
              <div className="relative bg-white/90 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-white/20 overflow-visible">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <CheckCircle className="text-white" size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Log Entry</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      className="w-full border-2 border-gray-200 rounded-2xl p-4 text-lg focus:ring-4 focus:ring-green-400/20 focus:border-green-400 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                      placeholder="Enter 'enter' or 'exit' action..."
                      value={logAction}
                      onChange={(e) => setLogAction(e.target.value)}
                    />
                  </div>
                  <button
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                    onClick={logEntry}
                    disabled={loading || !logAction.trim()}
                  >
                    {loading && responseType === 'logEntry' ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      `Submit ${logAction.toLowerCase().includes('enter') ? 'Entry' : logAction.toLowerCase().includes('exit') ? 'Exit' : 'Log'}`
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-600 rounded-3xl blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
              <div className="relative bg-white/90 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-white/20 overflow-visible">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Users className="text-white" size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Employee Actions</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      className="w-full border-2 border-gray-200 rounded-2xl p-4 text-lg focus:ring-4 focus:ring-blue-400/20 focus:border-blue-400 transition-all duration-300 bg-white/50 backdrop-blur-sm font-mono"
                      placeholder="Employee ID (GUID)"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.03] shadow-lg flex items-center justify-center space-x-2"
                      onClick={getLogsByEmployeeId}
                      disabled={loading || !employeeId.trim()}
                    >
                      <FileText size={16} />
                      <span>Get Logs</span>
                    </button>
                    
                    <button
                      className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.03] shadow-lg flex items-center justify-center space-x-2"
                      onClick={getAttendanceByEmployeeId}
                      disabled={loading || !employeeId.trim()}
                    >
                      <Clock size={16} />
                      <span>Attendance</span>
                    </button>
                    
                    <button
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.03] shadow-lg flex items-center justify-center space-x-2"
                      onClick={getAllLogs}
                      disabled={loading}
                    >
                      <FileText size={16} />
                      <span>All Logs</span>
                    </button>
                    
                    <button
                      className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.03] shadow-lg flex items-center justify-center space-x-2"
                      onClick={getAllAttendances}
                      disabled={loading}
                    >
                      <Calendar size={16} />
                      <span>All Attendance</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {(response || loading) && (
            <div className="group relative pb-8">
              <div className="absolute -inset-1 bg-gradient-to-r from-gray-400 to-slate-600 rounded-3xl blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
              <div className="relative bg-white/90 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-white/20 overflow-visible">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-slate-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Activity className="text-white" size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">API Response</h2>
                </div>
                
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    <span className="ml-4 text-lg text-gray-600">Loading data...</span>
                  </div>
                ) : (
                  <div className="animate-fade-in overflow-x-auto">
                    {renderTable()}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}