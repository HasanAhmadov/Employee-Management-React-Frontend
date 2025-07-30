// src/services/logService.js
import axios from "axios";

const API_URL = "/api/EmployeeLog";

export const logAction = (data) => axios.post(`${API_URL}/LogEntry`, data);

export const getAllLogs = () => axios.get(`${API_URL}/GetAllLogs`);

export const getLogsByEmployeeId = (id) =>
  axios.get(`${API_URL}/GetLogsByEmployeeId/${id}`);

export const getAttendanceByEmployeeId = (id) =>
  axios.get(`${API_URL}/GetAttendanceByEmployeeId/${id}`);

export const getAllAttendances = () => axios.get(`${API_URL}/GetAllEmployeesAttendances`);