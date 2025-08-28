import React, { useState } from 'react';
import { Eye, EyeOff, Check } from 'lucide-react';
import authService from '../services/authService';

const CourseraAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!isLogin && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (!isLogin && !formData.fullName) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!isLogin && !agreedToTerms) {
      newErrors.terms = 'You must agree to the terms';
    }
    
    return newErrors;
  };

  const handleSubmit = async () => {
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsLoading(true);
    
    try {
      let response;
      if (isLogin) {
        response = await authService.login(formData.email, formData.password);
      } else {
        response = await authService.signup(formData.fullName, formData.email, formData.password);
      }
      
      console.log('Success:', response);
      alert(`${isLogin ? 'Login' : 'Signup'} successful!`);
      // In a real app, redirect to dashboard:
      // window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error:', error.response?.data);
      setErrors({ 
        general: error.response?.data?.error || 
                 error.response?.data?.email?.[0] ||
                 error.response?.data?.password?.[0] ||
                 'An error occurred. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setFormData({
      fullName: '',
      email: '',
      password: ''
    });
    setAgreedToTerms(false);
    setShowPassword(false);
  };

  const Header = () => (
    <header className="bg-white border-b border-gray-200 px-4 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center cursor-pointer">
            <svg className="h-8 w-8 text-blue-600 mr-2" viewBox="0 0 32 32" fill="currentColor">
              <rect x="0" y="0" width="14" height="14" rx="2" />
              <rect x="18" y="0" width="14" height="14" rx="2" />
              <rect x="0" y="18" width="14" height="14" rx="2" />
              <rect x="18" y="18" width="14" height="14" rx="2" />
            </svg>
            <span className="text-2xl font-semibold text-gray-900">coursera</span>
          </div>
        </div>
      </div>
    </header>
  );

  const SocialButton = ({ provider, icon, onClick }) => (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-md hover:bg-gray-50 transition duration-200 mb-3 bg-white"
    >
      <span className="mr-2">{icon}</span>
      <span className="text-sm font-medium text-gray-700">Continue with {provider}</span>
    </button>
  );

  const passwordRequirements = [
    { met: formData.password.length >= 8, text: "At least 8 characters" },
    { met: /[A-Z]/.test(formData.password), text: "At least 1 capital letter" },
    { met: /[0-9]/.test(formData.password), text: "At least 1 number" },
    { met: !/\s/.test(formData.password), text: "No spaces" }
  ];

  const handleSocialAuth = (provider) => {
    console.log(`Social auth with ${provider}`);
    // For Django backend with social auth:
    // window.location.href = `/api/auth/social/${provider.toLowerCase()}/`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="p-8">
              <h1 className="text-2xl font-bold text-center text-gray-900 mb-8">
                {isLogin ? 'Welcome back' : 'Sign up'}
              </h1>
              
              {/* Error message */}
              {errors.general && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{errors.general}</p>
                </div>
              )}
              
              {/* Social Login Buttons */}
              <div className="space-y-3 mb-6">
                <SocialButton 
                  provider="Google"
                  onClick={() => handleSocialAuth('Google')}
                  icon={
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  }
                />
                <SocialButton 
                  provider="Facebook"
                  onClick={() => handleSocialAuth('Facebook')}
                  icon={
                    <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  }
                />
                <SocialButton 
                  provider="Apple"
                  onClick={() => handleSocialAuth('Apple')}
                  icon={
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.09l-.05-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                  }
                />
              </div>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">or</span>
                </div>
              </div>
              
              {/* Form Fields */}
              <div className="space-y-4">
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="Enter your full name"
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>
                    )}
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="name@email.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                  )}
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    {isLogin && (
                      <a href="#" className="text-sm text-blue-600 hover:underline">
                        Forgot password?
                      </a>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSubmit();
                        }
                      }}
                      className={`w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10`}
                      placeholder={isLogin ? "Enter your password" : "Create password"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                  )}
                  
                  {!isLogin && formData.password && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                      <p className="text-xs font-medium text-gray-700 mb-2">Password must contain:</p>
                      <ul className="space-y-1">
                        {passwordRequirements.map((req, index) => (
                          <li key={index} className="flex items-center text-xs">
                            <Check 
                              size={14} 
                              className={`mr-2 ${req.met ? 'text-green-500' : 'text-gray-300'}`}
                            />
                            <span className={req.met ? 'text-green-700' : 'text-gray-500'}>
                              {req.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                {!isLogin && (
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="terms" className="ml-2 text-xs text-gray-600">
                      I accept Coursera's{' '}
                      <a href="#" className="text-blue-600 hover:underline">Terms of Use</a> and{' '}
                      <a href="#" className="text-blue-600 hover:underline">Privacy Notice</a>. 
                      Having trouble logging in?{' '}
                      <a href="#" className="text-blue-600 hover:underline">Learner help center</a>
                    </label>
                  </div>
                )}
                {errors.terms && (
                  <p className="text-xs text-red-600 mt-1">{errors.terms}</p>
                )}
                
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className={`w-full ${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white py-3 px-4 rounded-md transition duration-200 font-medium`}
                >
                  {isLoading ? 'Processing...' : (isLogin ? 'Log in' : 'Sign up')}
                </button>
              </div>
              
              <div className="mt-6 text-center">
                <span className="text-sm text-gray-600">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button
                    onClick={switchMode}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {isLogin ? 'Sign up' : 'Log in'}
                  </button>
                </span>
              </div>
              
              {isLogin && (
                <div className="mt-4 text-center">
                  <a href="#" className="text-sm text-blue-600 hover:underline">
                    Log in with your organization
                  </a>
                </div>
              )}
            </div>
          </div>
          
          {/* Footer Links */}
          <div className="mt-6 text-center space-x-4 text-xs text-gray-500">
            <a href="#" className="hover:underline">Terms</a>
            <span>•</span>
            <a href="#" className="hover:underline">Privacy</a>
            <span>•</span>
            <a href="#" className="hover:underline">Help</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseraAuth;