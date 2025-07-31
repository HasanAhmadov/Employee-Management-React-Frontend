import axios from "axios";

const API_URL = "http://localhost:5042/api/Auth/Login"; // Update this if your URL changes

export const login = async (email, password) => {
  const response = await axios.post(API_URL, {
    email,
    password,
  });

  const token = response?.data?.token;
  const user = response?.data?.user;

  if (token) {
    localStorage.setItem("token", token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  if (user?.id) {
    localStorage.setItem("userId", user.id); // Save user ID to display on dashboard
  }

  return response.data;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userId"); // Clear user ID on logout
  delete axios.defaults.headers.common["Authorization"];
};

export const getToken = () => {
  return localStorage.getItem("token");
};
