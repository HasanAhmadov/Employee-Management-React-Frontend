# 🖥️ Employee Management React Frontend 

A modern, responsive **React.js** frontend application for managing employees, their attendance logs, permissions, and vacation requests. Built with **Vite**, **Tailwind CSS**, and **React Router** for a seamless user experience.

## ✨ Features

- **🔐 Authentication Flow**: Login/logout functionality with protected routes.
- **📊 Dashboard**: Overview of key metrics and data.
- **👥 Employee Management**: View and manage a list of employees.
- **⏱️ Attendance Tracking**: Log and review employee check-ins and check-outs.
- **🖐️ Permission Management**: Handle employee permission requests.
- **🏖️ Vacation Management**: Submit and track vacation requests.
- **🎨 Modern UI**: Built with **Tailwind CSS** for a clean and responsive design.
- **🛣️ Client-Side Routing**: Seamless navigation with **React Router**.

## 🏗️ Project Structure
Employee-Management-React-Frontend/
├── public/
│ └── index.html
├── src/
│ ├── assets/ 
│ │ └── react.svg
│ ├── context/
│ │ └── AuthContext.jsx 
│ ├── layouts/ 
│ │ └── MainLayout.jsx 
│ ├── pages/ 
│ │ ├── Auth/
│ │ │ └── Login.jsx 
│ │ ├── Dashboard/
│ │ │ └── Dashboard.jsx 
│ │ ├── employee/
│ │ │ └── EmployeeList.jsx 
│ │ ├── employeelog/
│ │ │ └── EmployeeLog.jsx 
│ │ ├── Permission/
│ │ │ └── Permission.jsx 
│ │ └── Vacation/
│ │ └── Vacation.jsx 
│ ├── router/ 
│ │ └── ProtectedRoute.jsx 
│ ├── services/ 
│ │ └── authService.js 
│ ├── App.jsx 
│ ├── main.jsx 
│ └── index.css 
├── package.json 
├── vite.config.js 
└── tailwind.config.js 

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher recommended)
- **npm** or **yarn** or **pnpm** package manager

### Installation & Running

1.  **Clone the repository**
    ```bash
    git clone https://github.com/HasanAhmadov/Employee-Management-React-Frontend.git
    cd Employee-Management-React-Frontend
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Configure the backend API URL**
    - The app needs to connect to your backend API.
    - You will likely need to update the base URL in the service files (e.g., `authService.js`) to point to your backend's address (e.g., `http://localhost:5000/api`).

4.  **Start the development server**
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```
    The application will open in your browser, typically at `http://localhost:5173`.

5.  **Build for production**
    To create an optimized production build:
    ```bash
    npm run build
    ```

## 🔐 Authentication Flow

1.  Users are presented with the **Login** page (`/login`) first.
2.  Upon successful login, a JWT token is stored (likely in localStorage or context).
3.  The **ProtectedRoute** component checks for this token.
4.  If authenticated, users can access protected pages like Dashboard, Employee List, etc.
5.  If not authenticated, users are redirected back to the login page.

## 🧩 Key Components

- **AuthContext**: Manages the global authentication state (user, token, login/logout functions).
- **ProtectedRoute**: A wrapper component that protects routes from unauthorized access.
- **MainLayout**: Provides a consistent layout (like a navigation bar) across all pages.

## 🙏 Acknowledgments

- **Vite** team for the fast build tooling.
- **Tailwind CSS** for the utility-first CSS framework.
- **React** team for the amazing library.
