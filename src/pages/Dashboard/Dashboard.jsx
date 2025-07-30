import { useNavigate } from "react-router-dom";
import { logout } from "../../services/authService";

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    console.log("Logging out...");
    logout();
    navigate("/login");
  };

  const sections = [
    { 
      name: "Employees", 
      path: "/employees",
      icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
    },
    { 
      name: "Employee Logs", 
      path: "/logs",
      icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    },
    { 
      name: "Permissions", 
      path: "/permissions",
      icon: "M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
    },
    { 
      name: "Vacations", 
      path: "/vacations",
      icon: "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm px-8 py-5 flex justify-between items-center sticky top-0 z-10 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Employee Portal
          </h1>
        </div>
        
        <div className="flex items-center space-x-6">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md text-gray-700 hover:text-red-600 transition-all duration-200 hover:border-red-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
              Management Dashboard
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Streamline your HR operations with our comprehensive management tools
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {sections.map((section) => (
            <div
              key={section.name}
              onClick={() => navigate(section.path)}
              className="relative cursor-pointer group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl shadow-lg transform group-hover:scale-105 transition-transform duration-300 opacity-70 group-hover:opacity-100"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-100 group-hover:border-blue-200 p-8 h-full flex flex-col items-center text-center transition-all duration-300 hover:shadow-xl">
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={section.icon} />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{section.name}</h3>
                <p className="text-gray-500 text-sm mb-6">Manage all {section.name.toLowerCase()} in one place</p>
                <button className="mt-auto px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:from-blue-600 hover:to-indigo-600">
                  Access {section.name}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 py-6 border-t border-gray-100 bg-white/50">
        <div className="container mx-auto px-6 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Employee Management System. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;