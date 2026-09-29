import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/common/PageHeader';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import Tabs from '../../components/common/Tabs';
import ConfirmModal from '../../components/common/ConfirmModal';
import './Settings.css';

function Settings() {
  const { user, updateProfile, changePassword, fetchProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [deleteAccountConfirm, setDeleteAccountConfirm] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    institution: user?.institution || '',
    avatar: user?.avatar || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        bio: user.bio || '',
        institution: user.institution || '',
        avatar: user.avatar || '',
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      await updateProfile(profileData);
      setMessage('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setMessage('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings">
      <PageHeader
        title="Settings"
        subtitle="Manage your profile, security, and preferences."
      />

      <div className="settings-layout">
        <div className="settings-sidebar">
          <div className="settings-profile-card">
            <div className="settings-avatar">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="settings-profile-info">
              <div className="settings-profile-name">{user?.name}</div>
              <div className="settings-profile-role">{user?.role}</div>
            </div>
          </div>

          <Tabs
            items={[
              { key: 'profile', label: 'Profile' },
              { key: 'security', label: 'Security' },
              { key: 'preferences', label: 'Preferences' }
            ]}
            active={activeTab}
            onChange={setActiveTab}
          />
        </div>

        <div className="settings-content">
          {message && <div className="auth-success">{message}</div>}
          {error && <div className="auth-error">{error}</div>}

          {activeTab === 'profile' && (
            <div className="settings-card">
              <h3 className="settings-card__title">Profile Information</h3>
              <form onSubmit={handleProfileUpdate}>
                <div className="form-group">
                  <label className="form-group-label">Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profileData.name}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-group-label">Email</label>
                  <input type="email" className="form-input" value={user?.email || ''} disabled />
                </div>
                <div className="form-group">
                  <label className="form-group-label">Institution</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profileData.institution}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, institution: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-group-label">Bio</label>
                  <textarea
                    className="form-input"
                    value={profileData.bio}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, bio: e.target.value }))}
                    rows={3}
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Update Profile'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="settings-card">
              <h3 className="settings-card__title">Change Password</h3>
              <form onSubmit={handlePasswordChange}>
                <div className="form-group">
                  <label className="form-group-label">Current Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-group-label">New Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                    required
                    minLength={6}
                  />
                </div>
                <div className="form-group">
                  <label className="form-group-label">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="settings-card">
              <h3 className="settings-card__title">Preferences</h3>
              <div className="form-group">
                <label className="form-group-label">Theme</label>
                <select className="form-select" defaultValue="light">
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-group-label">Notifications</label>
                <select className="form-select" defaultValue="all">
                  <option value="all">All notifications</option>
                  <option value="important">Important only</option>
                  <option value="none">None</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;
