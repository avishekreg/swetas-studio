import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, KeyRound, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AdminLogin = () => {
  const { signInWithEmailPassword, resetPassword, isAdmin, loading, user, profile } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [isAdmin, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setSubmitting(true);

    try {
      await signInWithEmailPassword(email.trim(), password);
      setNotice('Signed in. Checking your access...');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to sign in.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = async () => {
    setError('');
    setNotice('');
    if (!email.trim()) {
      setError('Enter the admin email first, then use password reset.');
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(email.trim());
      setNotice('Password reset email sent. Check the admin inbox.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to send reset email.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto px-4 py-16 lg:py-24"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 items-start">
        <section className="space-y-6">
          <p className="text-[10px] uppercase tracking-[0.35em] opacity-50">Studio Access</p>
          <h1 className="text-4xl md:text-5xl font-serif leading-tight">
            Default admin login for the boutique team.
          </h1>
          <p className="text-sm leading-relaxed opacity-65 max-w-xl">
            This login is for internal staff only. Customer accounts never receive admin access by default.
            Admin and super admin rights come from assigned roles, not from email shortcuts.
          </p>
          <div className="bg-white border border-black/5 shadow-sm p-6 space-y-3">
            <h2 className="text-sm uppercase tracking-widest font-bold opacity-60">Access model</h2>
            <p className="text-sm opacity-70">
              `super_admin` remains your recovery path. `admin` is the client's daily operating account.
              Additional staff roles can be added next without exposing super admin controls.
            </p>
            {user && !loading && !isAdmin && (
              <div className="flex items-start gap-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 p-4">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <p>
                  Signed in as <strong>{profile?.email || user.email}</strong>, but this account is not provisioned for admin access yet.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="bg-white border border-black/5 shadow-sm p-8 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-serif">Admin Sign In</h2>
            <p className="text-sm opacity-60">Use the client’s email/password account or your recovery super admin account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block space-y-2">
              <span className="text-[10px] uppercase tracking-[0.3em] opacity-50">Email</span>
              <div className="flex items-center gap-3 border border-black/10 px-4 py-3">
                <Mail size={16} className="opacity-40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent outline-none text-sm"
                  placeholder="admin@swetasstudio.com"
                />
              </div>
            </label>

            <label className="block space-y-2">
              <span className="text-[10px] uppercase tracking-[0.3em] opacity-50">Password</span>
              <div className="flex items-center gap-3 border border-black/10 px-4 py-3">
                <KeyRound size={16} className="opacity-40" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent outline-none text-sm"
                  placeholder="Enter your password"
                />
              </div>
            </label>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {notice && <p className="text-sm text-emerald-700">{notice}</p>}

            <div className="space-y-3">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-black text-white py-4 uppercase text-[10px] tracking-[0.35em] font-bold disabled:opacity-50"
              >
                {submitting ? 'Signing In...' : 'Admin Login'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={submitting}
                className="w-full border border-black/10 py-4 uppercase text-[10px] tracking-[0.35em] font-bold hover:border-black disabled:opacity-50"
              >
                Reset Password
              </button>
            </div>
          </form>

          <p className="text-[11px] opacity-45 leading-relaxed">
            If the client forgets both login and password, the super admin account remains the recovery path until we add the secure staff-management backend.
          </p>
          <Link to="/" className="inline-block text-[10px] uppercase tracking-[0.35em] opacity-50 hover:opacity-100">
            Back To Storefront
          </Link>
        </section>
      </div>
    </motion.div>
  );
};

export default AdminLogin;
