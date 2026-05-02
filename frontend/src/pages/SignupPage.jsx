import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'tenant',
    phone: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { user } = await signup(
        formData.name,
        formData.email,
        formData.password,
        formData.role,
        formData.phone,
      );
      navigate(user.role === 'landlord' ? '/dashboard' : '/browse');
    } catch (err) {
      setError(err.userMessage || err.response?.data?.message || 'Signup failed');
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
        <h1 className="mb-2 text-center text-3xl font-bold">Create account</h1>
        <p className="mb-6 text-center text-slate-400">Join as a tenant or landlord.</p>

        {error && <div className="mb-4 rounded-lg bg-red-500/15 p-3 text-red-200">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Full name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
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
            minLength="6"
            required
          />
          <input
            type="tel"
            placeholder="Phone number"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-2 rounded-lg bg-white/5 p-1">
            {['tenant', 'landlord'].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setFormData({ ...formData, role })}
                className={`rounded-md py-2 font-semibold capitalize ${
                  formData.role === role ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-white/10'
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-indigo-600 py-3 font-semibold hover:bg-indigo-500 disabled:opacity-60"
          >
            {submitting ? 'Creating...' : 'Sign up'}
          </button>
        </form>

        <p className="mt-5 text-center text-slate-300">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-indigo-300 hover:text-indigo-200">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
