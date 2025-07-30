import axios from "axios";

const API_URL = "http://localhost:5042/api/Auth/Login"; // <-- Replace if different

export const login = async (email, password) => {
  const response = await axios.post(API_URL, {
    email,
    password,
  });

  const token = response?.data?.token;
  if (token) {
    localStorage.setItem("token", token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  return response.data;
};

export const logout = () => {
  localStorage.removeItem("token");
  delete axios.defaults.headers.common["Authorization"];
};

export const getToken = () => {
  return localStorage.getItem("token");
};