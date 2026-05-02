import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { user } = await login(formData.email, formData.password);
      if (user.role === 'admin') navigate('/admin');
      else navigate(user.role === 'landlord' ? '/dashboard' : '/browse');
    } catch (err) {
      setError(err.userMessage || err.response?.data?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-bg flex min-h-screen items-center justify-center bg-navy px-4 py-12">
      <div className="glass w-full max-w-md p-8">
        <Link to="/" className="mb-8 block text-center text-2xl font-bold text-indigo-300">
          RentEase
        </Link>
        <h1 className="mb-2 text-center text-3xl font-bold">Welcome back</h1>
        <p className="mb-6 text-center text-slate-400">Log in to save listings or manage your rooms.</p>

        {error && <div className="mb-4 rounded-lg bg-red-500/15 p-3 text-red-200">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-indigo-600 py-3 font-semibold hover:bg-indigo-500 disabled:opacity-60"
          >
            {submitting ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-5 text-center text-slate-300">
          Need an account?{' '}
          <Link to="/signup" className="font-semibold text-indigo-300 hover:text-indigo-200">
            Sign up
          </Link>
        </p>
        <div className="mt-5 rounded-lg bg-white/5 p-3 text-sm text-slate-400">
          Admin demo: <span className="text-slate-200">admin@rentease.com</span> /{' '}
          <span className="text-slate-200">admin123</span>
        </div>
      </div>
    </div>
  );
}
