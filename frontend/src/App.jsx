import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
import { Home, Users, Building, ShieldAlert, LogOut, LogIn } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import CitizenPortal from './pages/CitizenPortal';
import AdminPortal from './pages/AdminPortal';
import DepartmentPortal from './pages/DepartmentPortal';
import Login from './pages/Login';
import { AuthProvider, AuthContext } from './AuthContext';

const Navbar = () => {
  const { user, logoutAuth } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutAuth();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                Samaadhan
              </span>
            </Link>
            
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              {/* Public link always visible for Overview */}
              <Link to="/" className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${location.pathname === '/' ? 'border-indigo-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>
                <Home className="w-5 h-5 mr-2" /> Public Dashboard
              </Link>

              {user?.role === 'admin' && (
                <Link to="/admin" className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${location.pathname === '/admin' ? 'border-indigo-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>
                  <ShieldAlert className="w-5 h-5 mr-2" /> Global Admin
                </Link>
              )}
              {user?.role === 'citizen' && (
                <Link to="/citizen" className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${location.pathname === '/citizen' ? 'border-indigo-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>
                  <Users className="w-5 h-5 mr-2" /> My Portal
                </Link>
              )}
              {user?.role === 'department' && (
                <Link to="/department" className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${location.pathname === '/department' ? 'border-indigo-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>
                  <Building className="w-5 h-5 mr-2" /> Department Inbox
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="text-sm font-medium text-gray-700 bg-gray-100 py-1 px-3 rounded-full hidden sm:block">
                  {user.name} ({user.role})
                </div>
                <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 transition border border-transparent hover:bg-red-50 p-2 rounded-lg flex items-center">
                  <span className="hidden sm:block mr-2 font-medium">Logout</span>
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <Link to="/login" className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition py-2 px-4 rounded-lg flex items-center font-medium">
                <LogIn className="w-4 h-4 mr-2" /> Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// PrivateRoute wrapper
const PrivateRoute = ({ children, allowedRoles }) => {
  const { user } = useContext(AuthContext);
  
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'department') return <Navigate to="/department" replace />;
    return <Navigate to="/citizen" replace />;
  }
  return children;
};

function AppRoutes() {
  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex-1 w-full">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          
          <Route path="/admin" element={
            <PrivateRoute allowedRoles={['admin']}>
              <AdminPortal />
            </PrivateRoute>
          } />
          
          <Route path="/citizen" element={
            <PrivateRoute allowedRoles={['citizen']}>
              <CitizenPortal />
            </PrivateRoute>
          } />
          
          <Route path="/department" element={
            <PrivateRoute allowedRoles={['department']}>
              <DepartmentPortal />
            </PrivateRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-50 font-sans text-gray-900">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
