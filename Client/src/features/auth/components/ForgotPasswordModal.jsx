import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSuccess(true);
    toast.success('Temporary password sent to your email');
    
    // Auto-close after 3 seconds
    setTimeout(() => {
      onClose();
      // Reset state for next time
      setTimeout(() => {
        setIsSuccess(false);
        setEmail('');
      }, 500);
    }, 3000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md overflow-hidden glass-card rounded-2xl p-8"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            {!isSuccess ? (
              <>
                <div className="mb-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neonPurple/20 text-neonPurple mb-4">
                    <Mail size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Forgot Password?</h3>
                  <p className="text-slate-400 mt-2">Enter your email and we'll send you a temporary password.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="relative group">
                    <input
                      type="email"
                      id="reset-email"
                      placeholder=" "
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="peer glass-input"
                    />
                    <label htmlFor="reset-email" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm transition-all duration-300 pointer-events-none peer-focus:-translate-y-7 peer-focus:text-xs peer-focus:text-neonPurple peer-[:not(:placeholder-shown)]:-translate-y-7 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-slate-300 bg-slate-900 px-1 rounded">
                      Email Address
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 btn-neon text-white flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      'Send Reset Password'
                    )}
                  </button>
                </form>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-8 text-center"
              >
                <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 size={48} className="animate-bounce" />
                </div>
                <h3 className="text-2xl font-bold text-white">Check Your Email</h3>
                <p className="text-slate-400 mt-2">
                  We've sent a temporary password to <span className="text-neonPurple font-medium">{email}</span>
                </p>
                <p className="text-sm text-slate-500 mt-6 italic">Closing in 3 seconds...</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ForgotPasswordModal;
