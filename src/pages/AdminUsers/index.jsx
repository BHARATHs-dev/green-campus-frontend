import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUsers, updateUserRole, deleteUser } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import ConfirmModal from '../../components/common/ConfirmModal';
import DataTable from '../../components/common/DataTable';
import './AdminUsers.css';

function AdminUsers() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getUsers();
      setUsers(res.data.users || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    loadUsers();
  }, [isAdmin, loadUsers]);

  const handleRoleChange = async (userId, newRole) => {
    setMessage('');
    setError('');
    try {
      await updateUserRole(userId, { role: newRole });
      setMessage('User role updated successfully');
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleDelete = async (userId) => {
    setDeleteConfirm(userId);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteUser(deleteConfirm);
      setMessage('User deleted successfully');
      setDeleteConfirm(null);
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  if (!isAdmin) {
    return (
      <div className="admin-users">
        <PageHeader title="Access Denied" subtitle="You do not have permission to access this page." />
        <ErrorState title="Access Denied" message="You do not have permission to access this page." />
      </div>
    );
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (val, row) => (
      <select
        className="form-select form-select--sm"
        value={val}
        onChange={(e) => handleRoleChange(row._id || row.id, e.target.value)}
      >
        <option value="Student">Student</option>
        <option value="Researcher">Researcher</option>
        <option value="Admin">Admin</option>
      </select>
    )},
    { key: 'createdAt', label: 'Created', render: (val) => new Date(val).toLocaleDateString() },
    { key: 'actions', label: 'Actions', width: 100, render: (_, row) => (
      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row._id || row.id)}>Delete</button>
    )}
  ];

  return (
    <div className="admin-users">
      <PageHeader
        title="User Management"
        subtitle="Manage user roles and access."
      />

      {message && <div className="auth-success">{message}</div>}
      {error && <div className="auth-error">{error}</div>}

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        emptyTitle="No users found"
        emptyDescription="No users have been registered yet."
      />

      {deleteConfirm && (
        <ConfirmModal
          title="Delete User"
          message="Are you sure you want to delete this user? This action cannot be undone."
          confirmLabel="Delete"
          danger
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}

export default AdminUsers;
