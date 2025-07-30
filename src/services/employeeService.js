// src/services/employeeService.js
import axios from "axios";

const API_URL = "/api/Employee";

export const getAllEmployees = () => axios.get(`${API_URL}/GetAllEmployees`);

export const getEmployeeById = (id) => axios.get(`${API_URL}/GetEmployeeById/${id}`);

export const addEmployee = (data) => axios.post(`${API_URL}/AddEmployee`, data);

export const updateEmployee = (id, data) =>
  axios.put(`${API_URL}/UpdateEmployee/${id}`, data);

export const deleteEmployee = (id) =>
  axios.delete(`${API_URL}/DeleteEmployee`, { data: { id } });