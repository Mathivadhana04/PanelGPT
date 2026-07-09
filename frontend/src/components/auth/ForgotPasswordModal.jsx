import React, { useState } from 'react';
import api from '../../services/api';
import Input from '../ui/Input';
import Button from '../ui/Button';

const ForgotPasswordModal = ({ onClose }) => {
  const [step, setStep] = useState('form'); // form | success
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, username, newPassword });
      setStep('success');
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md mx-4 p-8 rounded-2xl glass shadow-glass relative animate-debate-appear">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted hover:text-primary transition-colors text-xl leading-none"
        >
          ✕
        </button>

        {step === 'success' ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-xl font-extrabold font-heading text-primary mb-2">Password Reset!</h3>
            <p className="text-secondary text-sm mb-6">
              Your password has been updated. You can now log in with your new password.
            </p>
            <Button onClick={onClose} className="w-full">Back to Login</Button>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <h3 className="text-xl font-extrabold font-heading text-primary">Reset Password</h3>
              <p className="text-secondary text-sm mt-1">
                Enter your email and username to verify your identity, then set a new password.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                id="reset-email"
                label="Email Address"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                id="reset-username"
                label="Username"
                placeholder="Your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <Input
                id="reset-newpassword"
                label="New Password"
                type="password"
                placeholder="Min. 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <Input
                id="reset-confirm"
                label="Confirm New Password"
                type="password"
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <Button type="submit" loading={loading} className="w-full mt-2">
                Reset Password
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
