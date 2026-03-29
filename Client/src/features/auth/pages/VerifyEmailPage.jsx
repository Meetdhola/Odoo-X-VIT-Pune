import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link, useSearchParams } from 'react-router-dom';
import { authService } from '../services/auth.service.js';
import { Mail, CheckCircle2, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
  const [message, setMessage] = useState('');
  const [isAutoVerifying, setIsAutoVerifying] = useState(false);

  // Auto-fill and auto-verify from search params (Magic Link)
  useEffect(() => {
    const urlEmail = searchParams.get('email');
    const urlOtp = searchParams.get('otp');

    if (urlEmail && urlOtp) {
      setEmail(urlEmail);
      setOtp(urlOtp);
      setIsAutoVerifying(true);
      autoVerify(urlEmail, urlOtp);
    } else if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location, searchParams]);

  const autoVerify = async (e, o) => {
    setStatus('loading');
    try {
      const data = await authService.verifyEmail({ email: e, otp: o });
      setStatus('success');
      setMessage(data.message);
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Verification failed. Invalid or expired OTP.');
    } finally {
      setIsAutoVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setStatus('loading');
    try {
      const data = await authService.verifyEmail({ email, otp });
      setStatus('success');
      setMessage(data.message);
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Verification failed. Invalid or expired OTP.');
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen p-4 overflow-hidden bg-slate-950 text-white">
      {/* Background Blobs */}
      <div className="absolute top-0 -left-10 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob" />
      <div className="absolute top-10 -right-10 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-10 left-1/4 w-96 h-96 bg-indigo-600 rounded-full mix-blend-screen filter blur-3xl opacity-25 animate-blob animation-delay-4000" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="glass-card rounded-3xl p-8 md:p-10 text-center">
          
          {status === 'success' ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-4"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 text-green-500 mb-6">
                <CheckCircle2 size={48} className="animate-bounce" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Email Verified!</h2>
              <p className="text-slate-400 mb-8 leading-relaxed">
                {message || "Your account is now ready to use. You can sign in to access your dashboard."}
              </p>
              <Link to="/login">
                <button className="w-full py-3 btn-neon text-white flex items-center justify-center gap-2">
                  <span>Continue to Login</span>
                  <ArrowRight size={20} />
                </button>
              </Link>
            </motion.div>
          ) : (
            <>
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-neonBlue to-indigo-600 p-0.5 mb-6"
              >
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                  <ShieldCheck className="text-neonBlue" size={28} />
                </div>
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-2">Verify Email</h2>
              <p className="text-slate-400 mb-8">
                Enter the 6-digit code sent to your email.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6 text-left">
                <div className="relative group">
                  <input
                    type="email"
                    id="v-email"
                    placeholder=" "
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="peer glass-input pl-11"
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-neonBlue transition-colors" size={20} />
                  <label htmlFor="v-email" className="absolute left-11 top-1/2 -translate-y-1/2 text-slate-400 text-sm transition-all duration-300 pointer-events-none peer-focus:-translate-y-7 peer-focus:text-xs peer-focus:text-neonBlue peer-[:not(:placeholder-shown)]:-translate-y-7 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-slate-300 bg-slate-950 px-1 rounded">
                    Email Address
                  </label>
                </div>

                <div className="relative group">
                  <input
                    type="text"
                    id="v-otp"
                    placeholder=" "
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="peer glass-input text-center text-2xl font-bold tracking-[1em] focus:border-neonBlue focus:shadow-[0_0_15px_rgba(0,243,255,0.3)]"
                  />
                  <label htmlFor="v-otp" className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 text-slate-400 text-sm transition-all duration-300 pointer-events-none peer-focus:-translate-y-7 peer-focus:text-xs peer-focus:text-neonBlue peer-[:not(:placeholder-shown)]:-translate-y-7 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-slate-300 bg-slate-950 px-1 rounded">
                    6-Digit OTP
                  </label>
                </div>

                {status === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm"
                  >
                    <AlertCircle size={16} />
                    <span>{message}</span>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full py-3 btn-neon !from-neonBlue !to-indigo-600 text-white flex items-center justify-center gap-2"
                >
                  {status === 'loading' ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    'Verify OTP'
                  )}
                </button>
              </form>

              <div className="mt-8 text-center text-slate-400 text-sm">
                <Link to="/register" className="hover:text-neonBlue transition-colors">
                  Need a new account? <span className="font-semibold underline">Sign up</span>
                </Link>
              </div>
            </>
          )}

        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmailPage;
