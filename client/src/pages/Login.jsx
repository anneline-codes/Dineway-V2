import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login } = useAuthStore();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email format';
    if (!password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await authAPI.login({ email, password });
      login(response.data.data.user, response.data.data.accessToken);
      toast.success('Welcome back!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
      setErrors({ general: error.response?.data?.error || 'Login failed' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center px-4 bg-bg-primary">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-text-primary mb-2">
            Welcome <span className="text-gold">Back</span>
          </h1>
          <p className="text-text-muted">Sign in to your account</p>
        </div>

        {/* Form Card */}
        <div className="bg-bg-secondary border border-border rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="p-3 bg-error/10 border border-error rounded-md text-error text-sm">
                {errors.general}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
