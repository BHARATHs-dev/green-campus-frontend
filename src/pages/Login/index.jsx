import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-split">
        <div className="auth-brand">
          <div className="auth-brand__logo">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22v-8" />
              <path d="M12 14a7 7 0 007-7c0-2-1-4-3-5.5C15 1 12 3 12 3S9 1 8 1.5C6 3 5 5 5 7a7 7 0 007 7z" />
            </svg>
          </div>
          <div className="auth-brand__title">Green Campus AI</div>
          <div className="auth-brand__subtitle">Environmental Intelligence</div>
          <div className="auth-brand__tags">
            <span className="auth-brand__tag">AI</span>
            <span className="auth-brand__tag">GIS</span>
            <span className="auth-brand__tag">Biomass</span>
            <span className="auth-brand__tag">Carbon</span>
          </div>
        </div>
        <div className="auth-form">
          <div className="auth-form__header">
            <div className="auth-form__logo">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
            </div>
            <div className="auth-form__title">Login</div>
            <div className="auth-form__subtitle">Sign in to your account</div>
          </div>
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-group-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-group-label">Password</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <div className="auth-links">
            <Link to="/forgot-password">Forgot Password?</Link>
            <span>Don't have an account? <Link to="/register">Register</Link></span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
