import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Auth/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import ProtectedRoute from "./router/ProtectedRoute";
import { AuthProvider } from "./context/Authcontext";
import EmployeeList from "./pages/Employee/EmployeeList";
import EmployeeLog from "./pages/employeelog/EmployeeLog";
import PermissionDashboard from "./pages/Permission/Permission";
import VacationDashboard from "./pages/Vacation/Vacation";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employees"
            element={
              <ProtectedRoute>
                <EmployeeList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/logs"
            element={
              <ProtectedRoute>
                <EmployeeLog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/permissions"
            element={
              <ProtectedRoute>
                <PermissionDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vacations"
            element={
              <ProtectedRoute>
                <VacationDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;