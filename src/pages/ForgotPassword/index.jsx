import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
      setToken(res.data.resetToken);
      setShowResetForm(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetMessage('');

    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setResetError('Password must be at least 6 characters');
      return;
    }

    try {
      await api.post('/auth/reset-password', { token, newPassword });
      setResetMessage('Password reset successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setResetError(err.response?.data?.message || 'Failed to reset password');
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
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </div>
            <div className="auth-form__title">Forgot Password</div>
            <div className="auth-form__subtitle">Reset your account password</div>
          </div>

          {error && <div className="auth-error">{error}</div>}
          {message && <div className="auth-success">{message}</div>}

          {!showResetForm ? (
            <form onSubmit={handleForgotPassword}>
              <div className="form-group">
                <label className="form-group-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              <div className="auth-info">
                <p>Reset Token: <code>{token}</code></p>
                <p>Enter your new password below.</p>
              </div>
              {resetError && <div className="auth-error">{resetError}</div>}
              {resetMessage && <div className="auth-success">{resetMessage}</div>}
              <div className="form-group">
                <label className="form-group-label">New Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  minLength={6}
                />
              </div>
              <div className="form-group">
                <label className="form-group-label">Confirm Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Reset Password
              </button>
            </form>
          )}

          <div className="auth-links">
            <Link to="/login">Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
