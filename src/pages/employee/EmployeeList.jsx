// EmployeeApp.jsx (enhanced styling only)
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Routes, Route, Link, useNavigate } from "react-router-dom";

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

function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = () => {
    api
      .get("/GetAllEmployees")
      .then((res) => setEmployees(res.data))
      .catch(() => alert("Failed to fetch employees"));
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
    <div className="max-w-6xl mx-auto p-8 bg-white shadow-lg rounded-lg">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-900 tracking-wide select-none">
        Employees
      </h1>

      <button
        onClick={() => {
          setSelectedEmployee(null);
          setShowModal(true);
          setIsEditMode(false);
        }}
        className="mb-6 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-md hover:from-indigo-700 hover:to-purple-700 transition duration-300 font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-300"
      >
        + Add Employee
      </button>

      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-indigo-100 to-purple-100">
            <tr>
              {["Name", "Email", "Phone", "Salary", "Actions"].map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider select-none"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees.length > 0 ? (
              employees.map((e) => (
                <tr
                  key={e.id}
                  className="hover:bg-indigo-50 transition-colors duration-200 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">
                    {e.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{e.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {e.phone || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-indigo-700 font-semibold">
                    ₼{e.salary.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2 flex">
                    <button
                      onClick={() => handleView(e)}
                      className="px-3 py-1 bg-green-500 text-white rounded-md shadow-sm hover:bg-green-600 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-green-400"
                      aria-label={`View ${e.name}`}
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEdit(e)}
                      className="px-3 py-1 bg-yellow-400 text-white rounded-md shadow-sm hover:bg-yellow-500 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                      aria-label={`Edit ${e.name}`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(e.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded-md shadow-sm hover:bg-red-700 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-400"
                      aria-label={`Delete ${e.name}`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-12 text-gray-400 italic select-none"
                >
                  No employees found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-6">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-3xl font-extrabold mb-6 text-gray-900 select-none">
              {selectedEmployee
                ? isEditMode
                  ? "Edit Employee"
                  : "Employee Details"
                : "Add Employee"}
            </h2>

            {selectedEmployee && !isEditMode ? (
              <div className="space-y-4 text-gray-700 text-lg">
                <p>
                  <span className="font-semibold">Name:</span> {selectedEmployee.name}
                </p>
                <p>
                  <span className="font-semibold">Email:</span> {selectedEmployee.email}
                </p>
                <p>
                  <span className="font-semibold">Phone:</span>{" "}
                  {selectedEmployee.phone || "-"}
                </p>
                <p>
                  <span className="font-semibold">Salary:</span> ₼
                  {selectedEmployee.salary.toFixed(2)}
                </p>
                <p>
                  <span className="font-semibold">RoleId:</span>{" "}
                  {selectedEmployee.employeeRoleId}
                </p>
                <p>
                  <span className="font-semibold">BossId:</span> {selectedEmployee.bossId}
                </p>
                <p>
                  <span className="font-semibold">ShiftId:</span>{" "}
                  {selectedEmployee.employeeShiftId}
                </p>
                <button
                  onClick={() => setShowModal(false)}
                  className="mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-md transition duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-300"
                >
                  Close
                </button>
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
          </div>
        </div>
      )}
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
    <form onSubmit={handleSubmit} className="space-y-6 text-gray-800">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block font-semibold mb-2 text-gray-900 select-none">
          Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={form.name}
          onChange={handleChange}
          className={`w-full rounded-lg border-2 p-3 transition ${
            errors.name ? "border-red-500" : "border-gray-300"
          } focus:outline-none focus:ring-2 focus:ring-indigo-400`}
          required
        />
        {errors.name && <p className="text-red-600 mt-1">{errors.name}</p>}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block font-semibold mb-2 text-gray-900 select-none">
          Email *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          className={`w-full rounded-lg border-2 p-3 transition ${
            errors.email ? "border-red-500" : "border-gray-300"
          } focus:outline-none focus:ring-2 focus:ring-indigo-400`}
          required
        />
        {errors.email && <p className="text-red-600 mt-1">{errors.email}</p>}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block font-semibold mb-2 text-gray-900 select-none">
          Phone
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Optional"
          className="w-full rounded-lg border-2 border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
        />
      </div>

      {/* Salary */}
      <div>
        <label htmlFor="salary" className="block font-semibold mb-2 text-gray-900 select-none">
          Salary *
        </label>
        <input
          type="number"
          id="salary"
          name="salary"
          value={form.salary}
          onChange={handleChange}
          step="0.01"
          className={`w-full rounded-lg border-2 p-3 transition ${
            errors.salary ? "border-red-500" : "border-gray-300"
          } focus:outline-none focus:ring-2 focus:ring-indigo-400`}
          required
        />
        {errors.salary && <p className="text-red-600 mt-1">{errors.salary}</p>}
      </div>

      {/* Password */}
      {!isEdit && (
        <div>
          <label
            htmlFor="password"
            className="block font-semibold mb-2 text-gray-900 select-none"
          >
            Password *
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className={`w-full rounded-lg border-2 p-3 transition ${
              errors.password ? "border-red-500" : "border-gray-300"
            } focus:outline-none focus:ring-2 focus:ring-indigo-400`}
            required
          />
          {errors.password && <p className="text-red-600 mt-1">{errors.password}</p>}
        </div>
      )}

      {/* RoleId */}
      <div>
        <label htmlFor="roleId" className="block font-semibold mb-2 text-gray-900 select-none">
          Role ID *
        </label>
        <input
          type="number"
          id="roleId"
          name="roleId"
          value={form.roleId}
          onChange={handleChange}
          className={`w-full rounded-lg border-2 p-3 transition ${
            errors.roleId ? "border-red-500" : "border-gray-300"
          } focus:outline-none focus:ring-2 focus:ring-indigo-400`}
          required
        />
        {errors.roleId && <p className="text-red-600 mt-1">{errors.roleId}</p>}
      </div>

      {/* BossId */}
      <div>
        <label htmlFor="bossId" className="block font-semibold mb-2 text-gray-900 select-none">
          Boss ID (GUID) *
        </label>
        <input
          type="text"
          id="bossId"
          name="bossId"
          placeholder="e.g. 3fa85f64-5717-4562-b3fc-2c963f66afa6"
          value={form.bossId}
          onChange={handleChange}
          className={`w-full rounded-lg border-2 p-3 transition ${
            errors.bossId ? "border-red-500" : "border-gray-300"
          } focus:outline-none focus:ring-2 focus:ring-indigo-400`}
          required
        />
        {errors.bossId && <p className="text-red-600 mt-1">{errors.bossId}</p>}
      </div>

      {/* ShiftId */}
      <div>
        <label htmlFor="shiftId" className="block font-semibold mb-2 text-gray-900 select-none">
          Shift ID *
        </label>
        <input
          type="number"
          id="shiftId"
          name="shiftId"
          value={form.shiftId}
          onChange={handleChange}
          className={`w-full rounded-lg border-2 p-3 transition ${
            errors.shiftId ? "border-red-500" : "border-gray-300"
          } focus:outline-none focus:ring-2 focus:ring-indigo-400`}
          required
        />
        {errors.shiftId && <p className="text-red-600 mt-1">{errors.shiftId}</p>}
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 bg-gray-300 rounded-lg font-semibold hover:bg-gray-400 transition focus:outline-none focus:ring-4 focus:ring-gray-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition focus:outline-none focus:ring-4 focus:ring-indigo-300"
        >
          {isEdit ? "Update" : "Add"} Employee
        </button>
      </div>
    </form>
  );
}

export default function EmployeeApp() {
  const navigate = useNavigate();

  return (
    <>
      <nav className="bg-gradient-to-r from-indigo-800 via-purple-800 to-pink-700 p-5 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center text-white hover:underline focus:outline-none focus:ring-2 focus:ring-white rounded"
            aria-label="Back to Dashboard"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Dashboard
          </button>

          <span className="font-extrabold text-3xl text-white select-none tracking-wide">
            Employee Management
          </span>

          <div className="w-28" />
        </div>
      </nav>

      <main className="bg-gray-50 min-h-screen p-8">
        <Routes>
          <Route path="/" element={<EmployeeList />} />
        </Routes>
      </main>
    </>
  );
}