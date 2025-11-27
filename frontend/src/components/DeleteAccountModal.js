import React, { useState } from 'react';
import './DeleteAccountModal.css';

const DeleteAccountModal = ({ isOpen, onClose, onConfirm, loading }) => {
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Please enter your password');
      return;
    }

    if (confirmText !== 'DELETE') {
      setError('Please type DELETE to confirm');
      return;
    }

    onConfirm(password);
  };

  const handleClose = () => {
    setPassword('');
    setConfirmText('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>⚠️ Delete Account</h2>
          <button className="modal-close" onClick={handleClose}>&times;</button>
        </div>

        <div className="modal-body">
          <div className="warning-message">
            <p><strong>Warning:</strong> This action will permanently delete your account and all associated data.</p>
            <p>This includes:</p>
            <ul>
              <li>Your profile information</li>
              <li>Appointment history</li>
              <li>Medical records</li>
              <li>All personal data</li>
            </ul>
            <p><strong>This action cannot be undone.</strong></p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="password">Confirm Your Password *</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmText">
                Type <strong>DELETE</strong> to confirm *
              </label>
              <input
                type="text"
                id="confirmText"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type DELETE"
                disabled={loading}
                required
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                onClick={handleClose}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-danger"
                disabled={loading || confirmText !== 'DELETE'}
              >
                {loading ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
