import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Lock, Globe, Search, ChevronDown, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { COUNTRIES } from '../../shared/utils/countries.js';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    country: '',
    companyName: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Country Dropdown State
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);

  const filteredCountries = useMemo(() => {
    return COUNTRIES.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setFormData(prev => ({ ...prev, country: country.name }));
    setIsCountryOpen(false);
    setSearchTerm('');
  };

  const calculatePasswordStrength = (pass) => {
    if (!pass) return 0;
    let strength = 0;
    if (pass.length > 7) strength += 25;
    if (/[A-Z]/.test(pass)) strength += 25;
    if (/[0-9]/.test(pass)) strength += 25;
    if (/[^A-Za-z0-9]/.test(pass)) strength += 25;
    return strength;
  };

  const passwordStrength = useMemo(() => calculatePasswordStrength(formData.password), [formData.password]);

  const getStrengthColor = (strength) => {
    if (strength <= 25) return 'bg-red-500';
    if (strength <= 50) return 'bg-orange-500';
    if (strength <= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!selectedCountry) {
      toast.error('Please select a country');
      return;
    }

    setIsSubmitting(true);
    const success = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      country: formData.country,
      companyName: formData.companyName // Passing company name
    });
    setIsSubmitting(false);
    
    if (success) {
      navigate('/verify-email', { state: { email: formData.email } });
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen py-12 px-4 overflow-hidden bg-slate-950">
      {/* Animated Background Blobs */}
      <div className="absolute top-0 -left-10 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob" />
      <div className="absolute top-10 -right-10 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-10 left-1/4 w-96 h-96 bg-indigo-600 rounded-full mix-blend-screen filter blur-3xl opacity-25 animate-blob animation-delay-4000" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-xl"
      >
        <div className="glass-card rounded-[2rem] p-8 md:p-12">
          <div className="mb-10 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Admin Signup</h2>
            <p className="text-slate-400">Join our platform and manage your team efficiently</p>
            <div className="mt-4 inline-block px-4 py-1.5 rounded-full bg-neonPurple/10 border border-neonPurple/20 text-neonPurple text-xs font-semibold uppercase tracking-wider">
              Company will be created automatically
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Field */}
              <div className="relative group col-span-1 md:col-span-2">
                <input
                  type="text"
                  name="name"
                  id="reg-name"
                  placeholder=" "
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="peer glass-input pl-11"
                />
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-neonPurple transition-colors" size={20} />
                <label htmlFor="reg-name" className="absolute left-11 top-1/2 -translate-y-1/2 text-slate-400 text-sm transition-all duration-300 pointer-events-none peer-focus:-translate-y-7 peer-focus:text-xs peer-focus:text-neonPurple peer-[:not(:placeholder-shown)]:-translate-y-7 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-slate-300 bg-slate-950 px-1 rounded">
                  Full Name
                </label>
              </div>

              {/* Company Name Field */}
              <div className="relative group col-span-1 md:col-span-2">
                <input
                  type="text"
                  name="companyName"
                  id="reg-company"
                  placeholder=" "
                  required
                  value={formData.companyName}
                  onChange={handleChange}
                  className="peer glass-input pl-11"
                />
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-neonPurple transition-colors" size={20} />
                <label htmlFor="reg-company" className="absolute left-11 top-1/2 -translate-y-1/2 text-slate-400 text-sm transition-all duration-300 pointer-events-none peer-focus:-translate-y-7 peer-focus:text-xs peer-focus:text-neonPurple peer-[:not(:placeholder-shown)]:-translate-y-7 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-slate-300 bg-slate-950 px-1 rounded">
                  Company Name (Organization)
                </label>
              </div>

              {/* Email Field */}
              <div className="relative group col-span-1 md:col-span-2">
                <input
                  type="email"
                  name="email"
                  id="reg-email"
                  placeholder=" "
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="peer glass-input pl-11"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-neonPurple transition-colors" size={20} />
                <label htmlFor="reg-email" className="absolute left-11 top-1/2 -translate-y-1/2 text-slate-400 text-sm transition-all duration-300 pointer-events-none peer-focus:-translate-y-7 peer-focus:text-xs peer-focus:text-neonPurple peer-[:not(:placeholder-shown)]:-translate-y-7 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-slate-300 bg-slate-950 px-1 rounded">
                  Email Address
                </label>
              </div>

              {/* Password Field */}
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="reg-password"
                  placeholder=" "
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="peer glass-input pl-11 pr-11 text-sm md:text-base"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-neonPurple transition-colors" size={20} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <label htmlFor="reg-password" className="absolute left-11 top-1/2 -translate-y-1/2 text-slate-400 text-sm transition-all duration-300 pointer-events-none peer-focus:-translate-y-7 peer-focus:text-xs peer-focus:text-neonPurple peer-[:not(:placeholder-shown)]:-translate-y-7 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-slate-300 bg-slate-950 px-1 rounded">
                  Password
                </label>
                
                {/* Strength Indicator */}
                {formData.password && (
                  <div className="absolute -bottom-2 left-0 w-full px-1">
                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${passwordStrength}%` }}
                        className={`h-full ${getStrengthColor(passwordStrength)} transition-colors duration-500`}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="relative group">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  id="reg-confirm"
                  placeholder=" "
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="peer glass-input pl-11 pr-11 text-sm md:text-base"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-neonPurple transition-colors" size={20} />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <label htmlFor="reg-confirm" className="absolute left-11 top-1/2 -translate-y-1/2 text-slate-400 text-sm transition-all duration-300 pointer-events-none peer-focus:-translate-y-7 peer-focus:text-xs peer-focus:text-neonPurple peer-[:not(:placeholder-shown)]:-translate-y-7 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-slate-300 bg-slate-950 px-1 rounded">
                  Confirm
                </label>
              </div>

              {/* Country Dropdown */}
              <div className="relative col-span-1 md:col-span-2">
                <button
                  type="button"
                  onClick={() => setIsCountryOpen(!isCountryOpen)}
                  className={`w-full flex items-center justify-between glass-input pl-11 pr-4 text-left ${selectedCountry ? 'text-white' : 'text-slate-400'}`}
                >
                  <Globe className={`absolute left-4 top-1/2 -translate-y-1/2 ${isCountryOpen ? 'text-neonPurple' : 'text-slate-500'}`} size={20} />
                  <span>{selectedCountry ? `${selectedCountry.flag} ${selectedCountry.name}` : 'Select Country'}</span>
                  <ChevronDown className={`transition-transform duration-300 ${isCountryOpen ? 'rotate-180 text-neonPurple' : 'text-slate-500'}`} size={18} />
                </button>
                
                <AnimatePresence>
                  {isCountryOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute z-50 w-full mt-2 glass-card border-white/20 rounded-2xl shadow-2xl overflow-hidden max-h-64 flex flex-col"
                    >
                      <div className="p-3 border-b border-white/10 sticky top-0 bg-slate-900/90 backdrop-blur-md">
                        <div className="relative">
                          <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
                          <input
                            type="text"
                            placeholder="Search country..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg py-2 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-neonPurple/50"
                          />
                        </div>
                      </div>
                      <div className="overflow-y-auto custom-scrollbar flex-1">
                        {filteredCountries.map((country) => (
                          <button
                            key={country.code}
                            type="button"
                            onClick={() => handleCountrySelect(country)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-white/10 hover:text-white transition-colors border-b border-white/5 last:border-none"
                          >
                            <span className="text-xl">{country.flag}</span>
                            <span className="text-sm font-medium">{country.name}</span>
                            <span className="ml-auto text-xs text-slate-500 font-mono italic">{country.currency}</span>
                          </button>
                        ))}
                        {filteredCountries.length === 0 && (
                          <div className="px-4 py-8 text-center text-slate-500 text-sm">
                            <AlertCircle className="mx-auto mb-2 opacity-50" size={24} />
                            No countries found
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Currency Preview */}
            <AnimatePresence>
              {selectedCountry && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm"
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-lg font-bold">
                    {selectedCountry.symbol}
                  </div>
                  <div>
                    <span className="font-semibold text-white">Currency Preview:</span>
                    <p className="text-indigo-400/80">Your billing and data will be processed in {selectedCountry.currency} ({selectedCountry.name})</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 mt-4 btn-neon text-white flex items-center justify-center gap-2 group"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Create Company Account</span>
                  <CheckCircle2 size={20} className="group-hover:scale-110 transition-transform" />
                </>
              )}
            </button>
            <p className="text-center text-[10px] text-slate-500 uppercase tracking-widest font-bold">
              Only one admin permitted per company
            </p>
          </form>

          <p className="mt-10 text-center text-slate-400 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-neonPurple font-semibold hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
