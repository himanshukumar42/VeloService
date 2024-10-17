import { useState } from 'react';
import { Lock, Mail, User, Shield } from 'lucide-react';
import axios from 'axios';
import '../styles/globals.css';

const API_BASE_URL = 'http://localhost:8000/api/v1/user'; // Replace with your actual backend URL

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState('user');
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      let response;
      const requestData = {
        email: formData.email,
        password: formData.password
      };

      if (isRegistering) {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        requestData.name = formData.name;
        
        const registerUrl = activeTab === 'user' 
          ? `${API_BASE_URL}/register/`
          : `${API_BASE_URL}/owner/register/`;
        
        response = await axios.post(registerUrl, requestData);
        
        // After successful registration, switch back to sign-in mode
        if (response.status === 201) {
          setIsRegistering(false); // Switch back to login mode
          setFormData({ email: '', password: '', confirmPassword: '', name: '' }); // Reset form fields
        }
        
      } else {
        const loginUrl = activeTab === 'user'
          ? `${API_BASE_URL}/token/`
          : `${API_BASE_URL}/owner/token`;
        
        response = await axios.post(loginUrl, requestData);
        
        if (response.data.access) {
          // Store tokens
          localStorage.setItem('accessToken', response.data.access);
          localStorage.setItem('refreshToken', response.data.refresh);
          
          // Redirect based on user type
          window.location.href = activeTab === 'user' ? '/dashboard' : '/admin-panel';
        }
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isRegistering ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-gray-500">
            {isRegistering ? 'Sign up for a new account' : 'Sign in to your account to continue'}
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-gray-100 rounded-lg p-1 mb-8">
          <div className="flex">
            <button
              onClick={() => setActiveTab('user')}
              className={`tab-button ${
                activeTab === 'user' ? 'tab-button-active' : 'tab-button-inactive'
              }`}
            >
              <User className="w-4 h-4" />
              User
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`tab-button ${
                activeTab === 'admin' ? 'tab-button-active' : 'tab-button-inactive'
              }`}
            >
              <Shield className="w-4 h-4" />
              Admin
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {isRegistering && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  required
                  className="input-field input-field-with-icon"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="email"
                name="email"
                required
                className="input-field input-field-with-icon"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="password"
                name="password"
                required
                className="input-field input-field-with-icon"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {isRegistering && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  className="input-field input-field-with-icon"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          )}

          <button type="submit" className="btn-primary">
            {isRegistering 
              ? `Sign Up as ${activeTab === 'user' ? 'User' : 'Admin'}`
              : `Sign In as ${activeTab === 'user' ? 'User' : 'Admin'}`
            }
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 space-y-2">
          {!isRegistering && (
            <div className="text-sm text-gray-500 text-center">
              Forgot your password?{' '}
              <a href="#" className="text-primary-600 hover:text-primary-700 hover:underline">
                Reset it here
              </a>
            </div>
          )}
          <div className="text-sm text-gray-500 text-center">
            {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-primary-600 hover:text-primary-700 hover:underline"
            >
              {isRegistering ? 'Sign in' : 'Sign up'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
