import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, UserPlus, Github, Twitter, Sparkles } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    const result = await register(formData.username, formData.email, formData.password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="page-container gradient-bg">
      {/* Background elements */}
      <div className="bg-elements">
        <div className="bg-element"></div>
        <div className="bg-element"></div>
        <div className="bg-element"></div>
      </div>

      <div className="container">
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <div className="card-glass p-8 fade-in">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-glass rounded-full flex items-center justify-center mx-auto mb-6">
                  <UserPlus className="text-white" size={40} />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Join TaskFlow
                </h2>
                <p className="text-white/80 text-lg">
                  Create your account and boost productivity
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-500/20 border border-red-500/30 text-white px-4 py-3 rounded-xl backdrop-blur-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label htmlFor="username" className="block text-white/90 font-medium mb-2">
                      Username
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleChange}
                      className="input input-glass"
                      placeholder="Choose a username"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-white/90 font-medium mb-2">
                      Email address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="input input-glass"
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-white/90 font-medium mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleChange}
                        className="input input-glass pr-12"
                        placeholder="Create a password"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <p className="text-white/60 text-xs mt-1">
                      Must be at least 6 characters long
                    </p>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-white/90 font-medium mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="input input-glass pr-12"
                        placeholder="Confirm your password"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full justify-center py-3"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <UserPlus size={20} />
                      Create your account
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-2 bg-transparent text-white/70 text-sm">
                      Already have an account?
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <Link
                    to="/login"
                    className="btn btn-glass w-full justify-center py-3"
                  >
                    Sign in to your account
                  </Link>
                </div>
              </div>

              {/* Features List */}
              <div className="mt-8 space-y-3">
                <div className="flex items-center space-x-3 text-white/80">
                  <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                    <Sparkles size={12} className="text-green-400" />
                  </div>
                  <span className="text-sm">Beautiful, intuitive task management</span>
                </div>
                <div className="flex items-center space-x-3 text-white/80">
                  <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <Sparkles size={12} className="text-blue-400" />
                  </div>
                  <span className="text-sm">Real-time collaboration</span>
                </div>
                <div className="flex items-center space-x-3 text-white/80">
                  <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <Sparkles size={12} className="text-purple-400" />
                  </div>
                  <span className="text-sm">Smart productivity features</span>
                </div>
              </div>

              {/* Social links */}
              <div className="mt-6 flex justify-center space-x-4">
                <button className="btn-glass p-3 rounded-xl">
                  <Github size={20} />
                </button>
                <button className="btn-glass p-3 rounded-xl">
                  <Twitter size={20} />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-6">
              <p className="text-white/60 text-sm">
                © 2024 TaskFlow. Start organizing your life today.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;