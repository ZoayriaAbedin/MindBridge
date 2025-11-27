import React, { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';
import './AdminUsers.css';
import './AdminCommon.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll();
      setUsers(response.data.data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, isActive) => {
    if (!window.confirm(`Are you sure you want to ${isActive ? 'deactivate' : 'activate'} this user?`)) {
      return;
    }

    try {
      if (isActive) {
        await usersAPI.deactivate(userId);
      } else {
        await usersAPI.activate(userId);
      }
      loadUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      alert('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to DELETE ${userName}? This will deactivate their account permanently.`)) {
      return;
    }

    try {
      await usersAPI.delete(userId);
      loadUsers();
      alert('User account deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const getFilteredUsers = () => {
    let filtered = users;

    if (filter !== 'all') {
      filtered = filtered.filter(u => u.role === filter);
    }

    if (searchTerm) {
      filtered = filtered.filter(u => 
        u.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredUsers = getFilteredUsers();

  return (
    <div className="admin-users">
      <div className="page-header">
        <h1>User Management</h1>
        <p>View all platform users</p>
      </div>

      <div className="controls-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Users ({users.length})
          </button>
          <button
            className={`filter-btn ${filter === 'patient' ? 'active' : ''}`}
            onClick={() => setFilter('patient')}
          >
            Patients ({users.filter(u => u.role === 'patient').length})
          </button>
          <button
            className={`filter-btn ${filter === 'doctor' ? 'active' : ''}`}
            onClick={() => setFilter('doctor')}
          >
            Doctors ({users.filter(u => u.role === 'doctor').length})
          </button>
          <button
            className={`filter-btn ${filter === 'admin' ? 'active' : ''}`}
            onClick={() => setFilter('admin')}
          >
            Admins ({users.filter(u => u.role === 'admin').length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading users...</div>
      ) : filteredUsers.length > 0 ? (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Verified</th>
                <th>Joined</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>#{user.id}</td>
                  <td>
                    <div className="user-name">
                      {user.first_name} {user.last_name}
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge role-${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{user.phone || '-'}</td>
                  <td>
                    <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <span className={`verified-badge ${user.is_verified ? 'verified' : 'unverified'}`}>
                      {user.is_verified ? '✓' : '✗'}
                    </span>
                  </td>
                  <td>{formatDate(user.created_at)}</td>
                  <td>{user.last_login ? formatDate(user.last_login) : 'Never'}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleToggleStatus(user.id, user.is_active)}
                        className={`btn btn-small ${user.is_active ? 'btn-warning' : 'btn-success'}`}
                        title={user.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {user.is_active ? '🔒' : '✓'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id, `${user.first_name} ${user.last_name}`)}
                        className="btn btn-small btn-danger"
                        title="Delete User"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <h3>No users found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
