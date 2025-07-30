// src/services/permissionService.js
import axios from "axios";

const API_URL = "/api/Permission";

export const requestToBoss = (data) =>
  axios.post(`${API_URL}/RequestToBoss`, data);

export const createForEmployee = (data) =>
  axios.post(`${API_URL}/CreateForEmployee`, data);

export const updatePermissionStatus = (id, status) =>
  axios.put(`${API_URL}/${id}/status`, { status });

export const getMyPermissions = () => axios.get(`${API_URL}/MyPermissions`);