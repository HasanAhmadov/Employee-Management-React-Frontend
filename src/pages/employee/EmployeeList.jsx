import React, { useEffect, useState } from "react";
import axios from "axios";
import { Routes, Route, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  User, 
  Mail, 
  Phone, 
  DollarSign, 
  Key, 
  Shield, 
  Crown, 
  Clock,
  Eye,
  Edit2,
  Trash2,
  Plus,
  X
} from "lucide-react";
import { motion } from "framer-motion";

const api = axios.create({
  baseURL: "http://localhost:5042/api/Employee",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Chromatic color palette
const colors = {
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

function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = () => {
    setLoading(true);
    api
      .get("/GetAllEmployees")
      .then((res) => setEmployees(res.data))
      .catch(() => alert("Failed to fetch employees"))
      .finally(() => setLoading(false));
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        const response = await api.delete(`/DeleteEmployee/${id}`);
        if (response.status === 200) {
          setEmployees((prev) => prev.filter((e) => e.id !== id));
          alert("Employee deleted successfully");
        }
      } catch (error) {
        console.error("Delete error:", error);
        alert(`Delete failed: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const handleView = (employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
    setIsEditMode(false);
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
    setIsEditMode(true);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-4 md:mb-0"
        >
          Employee Management
        </motion.h1>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setSelectedEmployee(null);
            setShowModal(true);
            setIsEditMode(false);
          }}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
        >
          <Plus className="mr-2" size={18} />
          Add Employee
        </motion.button>
      </div>

      {/* Employee Table */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-200/50">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200/50">
            <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
              <tr>
                {["Name", "Email", "Phone", "Salary", "Actions"].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200/30">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
                    </div>
                  </td>
                </tr>
              ) : employees.length > 0 ? (
                employees.map((e) => (
                  <motion.tr
                    key={e.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="hover:bg-indigo-50/50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                          <User className="text-indigo-600" size={18} />
                        </div>
                        <div className="font-medium text-gray-900">{e.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      <div className="flex items-center">
                        <Mail className="mr-2 text-gray-400" size={16} />
                        {e.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      <div className="flex items-center">
                        <Phone className="mr-2 text-gray-400" size={16} />
                        {e.phone || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-indigo-700 font-semibold">
                        ₼{e.salary.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2 flex">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleView(e)}
                        className="flex items-center px-3 py-1 bg-green-500 text-white rounded-lg shadow-sm hover:bg-green-600 transition-colors duration-150"
                      >
                        <Eye className="mr-1" size={14} />
                        View
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEdit(e)}
                        className="flex items-center px-3 py-1 bg-yellow-400 text-white rounded-lg shadow-sm hover:bg-yellow-500 transition-colors duration-150"
                      >
                        <Edit2 className="mr-1" size={14} />
                        Edit
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(e.id)}
                        className="flex items-center px-3 py-1 bg-red-600 text-white rounded-lg shadow-sm hover:bg-red-700 transition-colors duration-150"
                      >
                        <Trash2 className="mr-1" size={14} />
                        Delete
                      </motion.button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-12 text-gray-400 italic"
                  >
                    No employees found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                {selectedEmployee
                  ? isEditMode
                    ? "Edit Employee"
                    : "Employee Details"
                  : "Add Employee"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {selectedEmployee && !isEditMode ? (
              <div className="space-y-4 text-gray-700">
                <DetailItem icon={<User className="text-indigo-500" />} label="Name" value={selectedEmployee.name} />
                <DetailItem icon={<Mail className="text-indigo-500" />} label="Email" value={selectedEmployee.email} />
                <DetailItem icon={<Phone className="text-indigo-500" />} label="Phone" value={selectedEmployee.phone || "-"} />
                <DetailItem icon={<DollarSign className="text-indigo-500" />} label="Salary" value={`₼${selectedEmployee.salary.toFixed(2)}`} />
                <DetailItem icon={<Shield className="text-indigo-500" />} label="Role ID" value={selectedEmployee.employeeRoleId} />
                <DetailItem icon={<Crown className="text-indigo-500" />} label="Boss ID" value={selectedEmployee.bossId} />
                <DetailItem icon={<Clock className="text-indigo-500" />} label="Shift ID" value={selectedEmployee.employeeShiftId} />
                
                <div className="pt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowModal(false)}
                    className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-md transition-all duration-300"
                  >
                    Close
                  </motion.button>
                </div>
              </div>
            ) : (
              <EmployeeForm
                employee={selectedEmployee}
                isEdit={isEditMode}
                onSuccess={() => {
                  setShowModal(false);
                  fetchEmployees();
                }}
                onCancel={() => setShowModal(false)}
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

function DetailItem({ icon, label, value }) {
  return (
    <div className="flex items-start">
      <div className="flex-shrink-0 mr-3 mt-1">
        {icon}
      </div>
      <div>
        <div className="text-sm font-semibold text-gray-500">{label}</div>
        <div className="text-lg text-gray-900">{value}</div>
      </div>
    </div>
  );
}

function EmployeeForm({ employee, isEdit, onSuccess, onCancel }) {
  const [form, setForm] = useState({
    name: employee?.name || "",
    email: employee?.email || "",
    phone: employee?.phone || "",
    salary: employee?.salary?.toString() || "",
    password: "",
    roleId: employee?.employeeRoleId?.toString() || "",
    bossId: employee?.bossId || "",
    shiftId: employee?.employeeShiftId?.toString() || "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name) newErrors.name = "Name is required";
    if (!form.email) newErrors.email = "Email is required";
    if (!form.salary || isNaN(form.salary)) newErrors.salary = "Valid salary is required";
    if (!isEdit && !form.password) newErrors.password = "Password is required";
    if (!form.roleId) newErrors.roleId = "Role ID is required";
    if (!form.bossId) newErrors.bossId = "Boss ID is required";
    if (!form.shiftId) newErrors.shiftId = "Shift ID is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      salary: parseFloat(form.salary),
      password: form.password,
      roleId: parseInt(form.roleId),
      bossId: form.bossId,
      shiftId: parseInt(form.shiftId),
    };

    const request = isEdit
      ? api.put(`/UpdateEmployee/${employee.id}`, payload)
      : api.post("/AddEmployee", payload);

    request
      .then(() => {
        alert(`Employee ${isEdit ? "updated" : "added"} successfully`);
        onSuccess();
      })
      .catch((error) => {
        alert(
          error.response?.data?.message ||
            `Failed to ${isEdit ? "update" : "add"} employee`
        );
      });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Name *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            className={`pl-10 w-full rounded-lg border-2 p-3 transition ${
              errors.name ? "border-red-500" : "border-gray-300 focus:border-indigo-500"
            } focus:outline-none focus:ring-2 focus:ring-indigo-200`}
            required
          />
        </div>
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="email"
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className={`pl-10 w-full rounded-lg border-2 p-3 transition ${
              errors.email ? "border-red-500" : "border-gray-300 focus:border-indigo-500"
            } focus:outline-none focus:ring-2 focus:ring-indigo-200`}
            required
          />
        </div>
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Phone
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Phone className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Optional"
            className="pl-10 w-full rounded-lg border-2 border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition"
          />
        </div>
      </div>

      {/* Salary */}
      <div>
        <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-1">
          Salary *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <DollarSign className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="number"
            id="salary"
            name="salary"
            value={form.salary}
            onChange={handleChange}
            step="0.01"
            className={`pl-10 w-full rounded-lg border-2 p-3 transition ${
              errors.salary ? "border-red-500" : "border-gray-300 focus:border-indigo-500"
            } focus:outline-none focus:ring-2 focus:ring-indigo-200`}
            required
          />
        </div>
        {errors.salary && <p className="mt-1 text-sm text-red-600">{errors.salary}</p>}
      </div>

      {/* Password */}
      {!isEdit && (
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Key className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="password"
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className={`pl-10 w-full rounded-lg border-2 p-3 transition ${
                errors.password ? "border-red-500" : "border-gray-300 focus:border-indigo-500"
              } focus:outline-none focus:ring-2 focus:ring-indigo-200`}
              required
            />
          </div>
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
        </div>
      )}

      {/* RoleId */}
      <div>
        <label htmlFor="roleId" className="block text-sm font-medium text-gray-700 mb-1">
          Role ID *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Shield className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="number"
            id="roleId"
            name="roleId"
            value={form.roleId}
            onChange={handleChange}
            className={`pl-10 w-full rounded-lg border-2 p-3 transition ${
              errors.roleId ? "border-red-500" : "border-gray-300 focus:border-indigo-500"
            } focus:outline-none focus:ring-2 focus:ring-indigo-200`}
            required
          />
        </div>
        {errors.roleId && <p className="mt-1 text-sm text-red-600">{errors.roleId}</p>}
      </div>

      {/* BossId */}
      <div>
        <label htmlFor="bossId" className="block text-sm font-medium text-gray-700 mb-1">
          Boss ID (GUID) *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Crown className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            id="bossId"
            name="bossId"
            placeholder="e.g. 3fa85f64-5717-4562-b3fc-2c963f66afa6"
            value={form.bossId}
            onChange={handleChange}
            className={`pl-10 w-full rounded-lg border-2 p-3 transition ${
              errors.bossId ? "border-red-500" : "border-gray-300 focus:border-indigo-500"
            } focus:outline-none focus:ring-2 focus:ring-indigo-200`}
            required
          />
        </div>
        {errors.bossId && <p className="mt-1 text-sm text-red-600">{errors.bossId}</p>}
      </div>

      {/* ShiftId */}
      <div>
        <label htmlFor="shiftId" className="block text-sm font-medium text-gray-700 mb-1">
          Shift ID *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Clock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="number"
            id="shiftId"
            name="shiftId"
            value={form.shiftId}
            onChange={handleChange}
            className={`pl-10 w-full rounded-lg border-2 p-3 transition ${
              errors.shiftId ? "border-red-500" : "border-gray-300 focus:border-indigo-500"
            } focus:outline-none focus:ring-2 focus:ring-indigo-200`}
            required
          />
        </div>
        {errors.shiftId && <p className="mt-1 text-sm text-red-600">{errors.shiftId}</p>}
      </div>

      <div className="flex justify-end space-x-4 pt-6">
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCancel}
          className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold text-gray-700 transition-all duration-300"
        >
          Cancel
        </motion.button>
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-semibold shadow-md transition-all duration-300"
        >
          {isEdit ? "Update" : "Add"} Employee
        </motion.button>
      </div>
    </form>
  );
}

export default function EmployeeApp() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 p-5 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/dashboard")}
            className="flex items-center text-white hover:text-indigo-200 transition-colors"
          >
            <ChevronLeft className="h-6 w-6 mr-2" />
            <span>Dashboard</span>
          </motion.button>

          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-extrabold text-3xl text-white tracking-wide"
          >
            Employee Management
          </motion.h1>

          <div className="w-28" />
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        <Routes>
          <Route path="/" element={<EmployeeList />} />
        </Routes>
      </main>
    </div>
  );
}