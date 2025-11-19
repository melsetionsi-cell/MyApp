import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, LogIn, Github, Twitter, Sparkles } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(email, password);
    
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
                  <Sparkles className="text-white" size={40} />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Welcome Back
                </h2>
                <p className="text-white/80 text-lg">
                  Sign in to your TaskFlow account
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
                    <label htmlFor="email" className="block text-white/90 font-medium mb-2">
                      Email address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input input-glass pr-12"
                        placeholder="Enter your password"
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
                      <LogIn size={20} />
                      Sign in to your account
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
                      New to TaskFlow?
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <Link
                    to="/register"
                    className="btn btn-glass w-full justify-center py-3"
                  >
                    Create your account
                  </Link>
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
                © 2024 TaskFlow. Beautiful task management.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;