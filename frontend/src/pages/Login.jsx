import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, signup } from '../api';
import { AuthContext } from '../AuthContext';
import { ShieldAlert, Users, Building, AlertCircle } from 'lucide-react';

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { loginAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isSignup) {
        const { data } = await signup({ name, email, password, role: 'citizen' });
        loginAuth(data);
        navigate('/citizen');
      } else {
        const { data } = await login({ email, password });
        loginAuth(data);
        
        if (data.role === 'admin') navigate('/admin');
        else if (data.role === 'department') navigate('/department');
        else navigate('/citizen');
      }
    } catch (err) {
      setError(err.response?.data?.message || (isSignup ? 'Failed to create account.' : 'Invalid credentials.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center bg-gray-50 pt-12 pb-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">{isSignup ? 'Create Account' : 'Sign In'}</h2>
          <p className="mt-2 text-sm text-gray-600">
            {isSignup ? 'Join Samaadhan today.' : 'Enter your credentials to access Samaadhan.'}
          </p>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button 
            type="button"
            onClick={() => { setIsSignup(false); setError(''); }}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition ${!isSignup ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Sign In
          </button>
          <button 
            type="button"
            onClick={() => { setIsSignup(true); setError(''); }}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition ${isSignup ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-center text-sm border border-red-200">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              {error}
            </div>
          )}
          
          {isSignup && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                required
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                placeholder="Jane Doe"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              placeholder="user@example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              required
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              placeholder="••••••••"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-medium py-2 rounded-lg hover:bg-indigo-700 transition shadow-md flex items-center justify-center h-11 mt-2"
          >
            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : (isSignup ? 'Sign Up' : 'Login')}
          </button>
        </form>

        {!isSignup && (
          <div className="pt-6 border-t border-gray-100 text-sm text-gray-500 text-center">
            <p className="font-semibold mb-2">Demo Accounts:</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center p-2 bg-gray-50 rounded">
                <ShieldAlert className="w-4 h-4 text-indigo-500 mb-1" />
                <span className="text-xs">admin@pscrm.com<br/>admin123</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-gray-50 rounded">
                <Building className="w-4 h-4 text-green-500 mb-1" />
                <span className="text-xs">water@pscrm.com<br/>dept123</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-gray-50 rounded">
                <Users className="w-4 h-4 text-blue-500 mb-1" />
                <span className="text-xs">citizen1@pscrm.com<br/>user123</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
