// src/services/vacationService.js
import axios from "axios";

const API_URL = "/api/vacation";

export const getRemainingVacation = (employeeId) =>
  axios.get(`${API_URL}/${employeeId}/left`);

export const requestVacation = (employeeId, data) =>
  axios.post(`${API_URL}/${employeeId}/request`, data);

export const approveOrReject = (data) =>
  axios.put(`${API_URL}/approve-or-reject`, data);